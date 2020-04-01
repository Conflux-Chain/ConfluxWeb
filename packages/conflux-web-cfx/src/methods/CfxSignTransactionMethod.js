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

import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import {SignTransactionMethod} from 'conflux-web-core-method';
import deasync from 'deasync';

export default class CfxSignTransactionMethod extends SignTransactionMethod {
    /**
     * @param {Utils} utils
     * @param {Object} formatters
     * @param {AbstractConfluxWebModule} moduleInstance
     *
     * @constructor
     */
    constructor(utils, formatters, moduleInstance) {
        super(utils, formatters, moduleInstance);
    }

    /**
     * This method will be executed before the RPC request.
     *
     * @method beforeExecution
     *
     * @param {AbstractConfluxWebModule} moduleInstance
     */
    beforeExecution(moduleInstance) {
        this.parameters[0] = this.formatters.inputTransactionFormatter(this.parameters[0], moduleInstance);
    }

    /**
     * Sends a JSON-RPC call request
     *
     * @method execute
     *
     * @callback callback callback(error, result)
     * @returns {Promise<Object|String>}
     */
    execute() {
        if (this.parameters[0].storageLimit === undefined) {
            this.parameters[0]['storageLimit'] = 100000000;
        }

        if (this.parameters[0].chainId === undefined) {
            this.parameters[0]['chainId'] = 0;
        }

        if (this.parameters[0].epochHeight === undefined) {
            this.parameters[0].epochHeight = this.getEpochHeight();
        }

        if (isString(this.parameters[1])) {
            const account = this.moduleInstance.accounts.wallet[this.parameters[1]];
            if (account) {
                return this.moduleInstance.transactionSigner.sign(this.parameters[0], account.privateKey);
            }
        }
        if (isNumber(this.parameters[0].from)) {
            const account = this.moduleInstance.accounts.wallet[this.parameters[0].from];
            if (account) {
                return this.moduleInstance.transactionSigner.sign(this.parameters[0], account.privateKey);
            }
        }

        return super.execute();
    }

    /* eslint no-unmodified-loop-condition: 0 */
    getEpochHeight() {
        let result;
        let isReturn = false;
        this.moduleInstance.currentProvider.send('cfx_epochNumber', []).then((epochNumber) => {
            result = epochNumber;
            isReturn = true;
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }
        return result;
    }
}
