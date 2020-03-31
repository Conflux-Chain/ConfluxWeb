/*
    This file is part of confluxWeb.

    confluxWeb is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    confluxWeb is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with confluxWeb.  If not, see <http://www.gnu.org/licenses/>.
*/

import SendTransactionMethod from './SendTransactionMethod';

export default class CfxSendTransactionMethod extends SendTransactionMethod {
    /**
     * @param {Utils} utils
     * @param {Object} formatters
     * @param {AbstractConfluxWebModule} moduleInstance
     * @param {TransactionObserver} transactionObserver
     * @param {ChainIdMethod} chainIdMethod
     * @param {GetTransactionCountMethod} getTransactionCountMethod
     *
     * @constructor
     */
    constructor(utils, formatters, moduleInstance, transactionObserver, chainIdMethod, getTransactionCountMethod) {
        super(utils, formatters, moduleInstance, transactionObserver);

        this.chainIdMethod = chainIdMethod;
        this.getTransactionCountMethod = getTransactionCountMethod;
    }

    /**
     * This type will be used in the AbstractMethodFactory.
     *
     * @returns {String}
     */
    static get Type() {
        return 'cfx-send-transaction-method';
    }

    /**
     * This method will be executed before the RPC request.
     *
     * @method beforeExecution
     *
     * @param {AbstractConfluxWebModule} moduleInstance - The module where the method is called from for example Cfx.
     */
    beforeExecution(moduleInstance) {
        if (this.rpcMethod !== 'cfx_sendRawTransaction') {
            super.beforeExecution(moduleInstance);
        }
    }

    /**
     * Checks if gasPrice is set, sends the request and returns a PromiEvent Object
     *
     * @method execute
     *
     * @callback callback callback(error, result)
     * @returns {PromiEvent}
     */
    execute() {
        if (!this.parameters[0].gas && this.moduleInstance.defaultGas) {
            this.parameters[0]['gas'] = this.moduleInstance.defaultGas;
        }

        if (!this.parameters[0].gasPrice && this.parameters[0].gasPrice !== 0) {
            if (!this.moduleInstance.defaultGasPrice) {
                this.moduleInstance.currentProvider
                    .send('cfx_gasPrice', [])
                    .then((gasPrice) => {
                        this.parameters[0].gasPrice = gasPrice;

                        this.execute();
                    })
                    .catch((error) => {
                        this.handleError(error, false, 0);
                    });

                return this.promiEvent;
            }

            this.parameters[0]['gasPrice'] = this.moduleInstance.defaultGasPrice;
        }

        if (this.hasAccounts() && this.isDefaultSigner()) {
            if (this.moduleInstance.accounts.wallet[this.parameters[0].from]) {
                this.sendRawTransaction(this.moduleInstance.accounts.wallet[this.parameters[0].from].privateKey).catch(
                    (error) => {
                        this.handleError(error, false, 0);
                    }
                );

                return this.promiEvent;
            }
        }

        if (this.hasCustomSigner()) {
            this.sendRawTransaction().catch((error) => {
                this.handleError(error, false, 0);
            });

            return this.promiEvent;
        }

        return super.execute();
    }

    /**
     * Signs the transaction and executes the SendRawTransaction method.
     *
     * @method sendRawTransaction
     *
     * @param {String} privateKey
     *
     * @returns {PromiEvent}
     */
    async sendRawTransaction(privateKey = null) {
        this.beforeExecution(this.moduleInstance);

        // if (!this.parameters[0].chainId) {
        //     this.parameters[0].chainId = await this.chainIdMethod.execute();
        // }

        if (!this.parameters[0].nonce && this.parameters[0].nonce !== 0) {
            this.getTransactionCountMethod.parameters = [this.parameters[0].from, 'latest_state'];

            this.parameters[0].nonce = await this.getTransactionCountMethod.execute();
        }

        if (!this.parameters[0].storageLimit) {
            this.parameters[0]['storageLimit'] = 100000000;
        }

        if (!this.parameters[0].chainId) {
            this.parameters[0]['chainId'] = 0;
        }

        if (!this.parameters[0].epochHeight) {
            this.parameters[0].epochHeight = await this.moduleInstance.currentProvider.send('cfx_epochNumber', []);
        }

        let transaction = this.parameters[0];
        transaction.to = transaction.to || '0x';
        transaction.data = transaction.data || '0x';
        transaction.value = transaction.value || '0x';
        // transaction.chainId = this.utils.numberToHex(transaction.chainId);
        delete transaction.from;

        const response = await this.moduleInstance.transactionSigner.sign(transaction, privateKey);

        this.parameters = [response.rawTransaction];
        this.rpcMethod = 'cfx_sendRawTransaction';

        return super.execute();
    }

    /**
     * Checks if the current module has decrypted accounts
     *
     * @method isDefaultSigner
     *
     * @returns {Boolean}
     */
    isDefaultSigner() {
        return this.moduleInstance.transactionSigner.type === 'TransactionSigner';
    }

    /**
     * Checks if the current module has decrypted accounts
     *
     * @method hasAccounts
     *
     * @returns {Boolean}
     */
    hasAccounts() {
        return this.moduleInstance.accounts && this.moduleInstance.accounts.wallet.accountsIndex > 0;
    }

    /**
     * Checks if a custom signer is given.
     *
     * @method hasCustomerSigner
     *
     * @returns {Boolean}
     */
    hasCustomSigner() {
        return this.moduleInstance.transactionSigner.type !== 'TransactionSigner';
    }
}
