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

import PromiEvent from '../../PromiEvent';
import AbstractMethod from '../AbstractMethod';

export default class AbstractObservedTransactionMethod extends AbstractMethod {
    /**
     * @param {String} rpcMethod
     * @param {Number} parametersAmount
     * @param {Utils} utils
     * @param {Object} formatters
     * @param {AbstractConfluxWebModule} moduleInstance
     * @param {TransactionObserver} transactionObserver
     *
     * @constructor
     */
    constructor(rpcMethod, parametersAmount, utils, formatters, moduleInstance, transactionObserver) {
        super(rpcMethod, parametersAmount, utils, formatters, moduleInstance);

        this.transactionObserver = transactionObserver;
        this.promiEvent = new PromiEvent();
    }

    /**
     * This type will be used in the AbstractMethodFactory.
     *
     * @returns {String}
     */
    static get Type() {
        return 'observed-transaction-method';
    }

    execute() {
        this.beforeExecution(this.moduleInstance);

        this.moduleInstance.currentProvider
            .send(this.rpcMethod, this.parameters)
            .then((transactionHash) => {
                if (this.callback) {
                    this.promiEvent.resolve(this.callback(false, transactionHash));
                    return;
                }
                this.promiEvent.resolve(transactionHash);
            })
            .catch((error) => {
                if (this.callback) {
                    this.callback(error, null);
                    return;
                }
                this.handleError(error, false, 0);
            });

        return this.promiEvent;
    }

    /**
     * Sends the request and returns a PromiEvent Object
     *
     * @method execute
     *
     *
     * @callback callback callback(error, result)
     * @returns {PromiEvent}
     */
    // executeOld() {
    //     this.beforeExecution(this.moduleInstance);
    //
    //     this.moduleInstance.currentProvider
    //         .send(this.rpcMethod, this.parameters)
    //         .then((transactionHash) => {
    //             let confirmations, receipt;
    //
    //             if (this.callback) {
    //                 this.callback(false, transactionHash);
    //
    //                 return;
    //             }
    //
    //             this.promiEvent.emit('transactionHash', transactionHash);
    //
    //             const transactionConfirmationSubscription = this.transactionObserver.observe(transactionHash).subscribe(
    //                 (transactionConfirmation) => {
    //                     confirmations = transactionConfirmation.confirmations;
    //                     receipt = transactionConfirmation.receipt;
    //
    //                     if (!receipt.status) {
    //                         if (this.parameters[0].gas === receipt.gasUsed) {
    //                             this.handleError(
    //                                 new Error(
    //                                     `Transaction ran out of gas. Please provide more gas:\n${JSON.stringify(
    //                                         receipt,
    //                                         null,
    //                                         2
    //                                     )}`
    //                                 ),
    //                                 receipt,
    //                                 confirmations
    //                             );
    //
    //                             transactionConfirmationSubscription.unsubscribe();
    //
    //                             return;
    //                         }
    //
    //                         this.handleError(
    //                             new Error(
    //                                 `Transaction has been reverted by the EVM:\n${JSON.stringify(receipt, null, 2)}`
    //                             ),
    //                             receipt,
    //                             confirmations
    //                         );
    //
    //                         transactionConfirmationSubscription.unsubscribe();
    //
    //                         return;
    //                     }
    //
    //                     this.promiEvent.emit('confirmation', confirmations, this.afterExecution(receipt));
    //                 },
    //                 (error) => {
    //                     this.handleError(error, receipt, confirmations);
    //                 },
    //                 () => {
    //                     if (this.promiEvent.listenerCount('receipt') > 0) {
    //                         this.promiEvent.emit('receipt', this.afterExecution(receipt));
    //                         this.promiEvent.removeAllListeners();
    //
    //                         return;
    //                     }
    //
    //                     this.promiEvent.resolve(this.afterExecution(receipt));
    //                 }
    //             );
    //         })
    //         .catch((error) => {
    //             if (this.callback) {
    //                 this.callback(error, null);
    //
    //                 return;
    //             }
    //
    //             this.handleError(error, false, 0);
    //         });
    //
    //     return this.promiEvent;
    // }

    /**
     * This methods calls the correct error methods of the PromiEvent object.
     *
     * @method handleError
     *
     * @param {Error} error
     * @param {Object} receipt
     * @param {Number} confirmations
     */
    handleError(error, receipt, confirmations) {
        if (this.promiEvent.listenerCount('error') > 0) {
            this.promiEvent.emit('error', error, receipt, confirmations);
            this.promiEvent.removeAllListeners();

            return;
        }

        this.promiEvent.reject(error);
    }
}
