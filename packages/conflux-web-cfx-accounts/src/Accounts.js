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

import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import Hash from 'cfx-lib/lib/hash';
import RLP from 'cfx-lib/lib/rlp';
import Bytes from 'cfx-lib/lib/bytes';
import {encodeSignature, recover} from 'cfx-lib/lib/account'; // TODO: Remove this dependency
import {AbstractConfluxWebModule} from 'conflux-web-core';
import Account from './models/Account';
import Wallet from './models/Wallet';

// TODO: Rename Accounts module to Wallet and move the Wallet class to the cfx module.
export default class Accounts extends AbstractConfluxWebModule {
    /**
     * @param {ConfluxWebCfxProvider|HttpProvider|WebsocketProvider|IpcProvider|String} provider
     * @param {Object} formatters
     * @param {Utils} utils
     * @param {MethodFactory} methodFactory
     * @param {Object} options
     * @param {Net.Socket} net
     *
     * @constructor
     */
    constructor(provider, utils, formatters, methodFactory, options, net) {
        super(provider, options, methodFactory, net);

        this.utils = utils;
        this.formatters = formatters;
        this._transactionSigner = options.transactionSigner;
        this.defaultKeyName = 'confluxweb_wallet';
        this.accounts = {};
        this.accountsIndex = 0;
        this.wallet = new Wallet(utils, this);
    }

    /**
     * Getter for the transactionSigner property
     *
     * @property transactionSigner
     *
     * @returns {TransactionSigner}
     */
    get transactionSigner() {
        return this._transactionSigner;
    }

    /**
     * TODO: Remove setter
     *
     * Setter for the transactionSigner property
     *
     * @property transactionSigner
     *
     * @param {TransactionSigner} transactionSigner
     */
    set transactionSigner(transactionSigner) {
        if (transactionSigner.type && transactionSigner.type === 'TransactionSigner') {
            throw new Error('Invalid TransactionSigner given!');
        }

        this._transactionSigner = transactionSigner;
    }

    /**
     * Creates an account with a given entropy
     *
     * @method create
     *
     * @param {String} entropy
     *
     * @returns {Account}
     */
    create(entropy) {
        return Account.from(entropy, this);
    }

    /**
     * Creates an Account object from a privateKey
     *
     * @method privateKeyToAccount
     *
     * @param {String} privateKey
     *
     * @returns {Account}
     */
    privateKeyToAccount(privateKey) {
        return Account.fromPrivateKey(privateKey, this);
    }

    /**
     * Hashes a given message
     *
     * @method hashMessage
     *
     * @param {String} data
     *
     * @returns {String}
     */
    hashMessage(data) {
        if (this.utils.isHexStrict(data)) {
            data = this.utils.hexToBytes(data);
        }

        const messageBuffer = Buffer.from(data);
        const preambleBuffer = Buffer.from(`\u0019Ethereum Signed Message:\n${data.length}`);
        const cfxMessage = Buffer.concat([preambleBuffer, messageBuffer]);

        return Hash.keccak256s(cfxMessage);
    }

    /**
     * TODO: Add deprecation message and extend the signTransaction method in the cfx module
     *
     * Signs a transaction object with the given privateKey
     *
     * @method signTransaction
     *
     * @param {Object} tx
     * @param {String} privateKey
     * @param {Function} callback
     *
     * @callback callback callback(error, result)
     * @returns {Promise<Object>}
     */
    async signTransaction(tx, privateKey, callback) {
        try {
            const account = Account.fromPrivateKey(privateKey, this);

            if (!tx.chainId) {
                tx.chainId = await this.getChainId();
            }

            if (!tx.gasPrice) {
                tx.gasPrice = await this.getGasPrice();
            }

            if (!tx.nonce) {
                tx.nonce = await this.getTransactionCount(account.address);
            }

            const signedTransaction = await this.transactionSigner.sign(
                this.formatters.inputCallFormatter(tx, this),
                account.privateKey
            );

            if (isFunction(callback)) {
                callback(false, signedTransaction);
            }

            return signedTransaction;
        } catch (error) {
            if (isFunction(callback)) {
                callback(error, null);

                return;
            }

            throw error;
        }
    }

    /**
     * Recovers transaction
     *
     * @method recoverTransaction
     *
     * @param {String} rawTx
     *
     * @returns {String}
     */
    recoverTransaction(rawTx) {
        const values = RLP.decode(rawTx);
        const signature = encodeSignature(values.slice(6, 9));
        const recovery = Bytes.toNumber(values[6]);
        const extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];
        const signingData = values.slice(0, 6).concat(extraData);
        const signingDataHex = RLP.encode(signingData);

        return recover(Hash.keccak256(signingDataHex), signature);
    }

    /**
     * Signs a string with the given privateKey
     *
     * @method sign
     *
     * @param {String} data
     * @param {String} privateKey
     *
     * @returns {Object}
     */
    sign(data, privateKey) {
        if (this.utils.isHexStrict(data)) {
            data = this.utils.hexToBytes(data);
        }

        return Account.fromPrivateKey(privateKey, this).sign(data);
    }

    /**
     * Recovers the Conflux address which was used to sign the given data.
     *
     * @method recover
     *
     * @param {String|Object} message
     * @param {String} signature
     * @param {Boolean} preFixed
     *
     * @returns {String}
     */
    recover(message, signature, preFixed) {
        if (isObject(message)) {
            return this.recover(message.messageHash, encodeSignature([message.v, message.r, message.s]), true);
        }

        if (!preFixed) {
            message = this.hashMessage(message);
        }

        if (arguments.length >= 4) {
            // v, r, s
            return this.recover(
                arguments[0],
                encodeSignature([arguments[1], arguments[2], arguments[3]]),
                !!arguments[4]
            );
        }

        return recover(message, signature);
    }

    /**
     * Decrypts account
     *
     *
     * @method decrypt
     *
     * @param {Object|String} v3Keystore
     * @param {String} password
     * @param {Boolean} nonStrict
     *
     * @returns {Account}
     */
    decrypt(v3Keystore, password, nonStrict) {
        return Account.fromV3Keystore(v3Keystore, password, nonStrict, this);
    }

    /**
     * Encrypts the account
     *
     * @method encrypt
     *
     * @param {String} privateKey
     * @param {String} password
     * @param {Object} options
     *
     * @returns {Object}
     */
    encrypt(privateKey, password, options) {
        return Account.fromPrivateKey(privateKey, this).toV3Keystore(password, options);
    }
}
