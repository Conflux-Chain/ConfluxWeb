import {formatters} from 'conflux-web-core-helpers';
import {WebsocketProvider} from 'conflux-web-providers';
import {AbstractConfluxWebModule} from 'conflux-web-core';
import * as Utils from 'conflux-web-utils';
import TransactionSigner from '../../../__mocks__/TransactionSigner';
import ChainIdMethod from '../../../../src/methods/network/ChainIdMethod';
import TransactionObserver from '../../../../src/observers/TransactionObserver';
import GetTransactionCountMethod from '../../../../src/methods/account/GetTransactionCountMethod';
import CfxSendTransactionMethod from '../../../../src/methods/transaction/CfxSendTransactionMethod';
import AbstractObservedTransactionMethod from '../../../../lib/methods/transaction/AbstractObservedTransactionMethod';

// Mocks
jest.mock('conflux-web-core-helpers');
jest.mock('conflux-web-utils');
jest.mock('conflux-web-providers');
jest.mock('conflux-web-core');
jest.mock('../../../../src/methods/network/ChainIdMethod');
jest.mock('../../../../src/observers/TransactionObserver');
jest.mock('../../../../src/methods/account/GetTransactionCountMethod');

/**
 * CfxSendTransactionMethod test
 */
describe('CfxSendTransactionMethodTest', () => {
    let method,
        providerMock,
        moduleInstanceMock,
        transactionSignerMock,
        chainIdMethodMock,
        getTransactionCountMethodMock,
        transactionObserverMock;

    beforeEach(() => {
        new WebsocketProvider({});
        providerMock = WebsocketProvider.mock.instances[0];
        providerMock.send = jest.fn(() => {
            return Promise.resolve('0x0');
        });

        new AbstractConfluxWebModule(providerMock, {}, {}, {});
        moduleInstanceMock = AbstractConfluxWebModule.mock.instances[0];
        moduleInstanceMock.currentProvider = providerMock;

        transactionSignerMock = new TransactionSigner();
        transactionSignerMock.type = 'TransactionSigner';
        transactionSignerMock.sign = jest.fn();

        new GetTransactionCountMethod();
        getTransactionCountMethodMock = GetTransactionCountMethod.mock.instances[0];

        new ChainIdMethod();
        chainIdMethodMock = ChainIdMethod.mock.instances[0];

        new TransactionObserver();
        transactionObserverMock = TransactionObserver.mock.instances[0];

        method = new CfxSendTransactionMethod(
            Utils,
            formatters,
            moduleInstanceMock,
            transactionObserverMock,
            chainIdMethodMock,
            getTransactionCountMethodMock
        );

        method.parameters = [{}];
    });

    it('constructor check', () => {
        expect(method.chainIdMethod).toEqual(chainIdMethodMock);

        expect(method.getTransactionCountMethod).toEqual(getTransactionCountMethodMock);

        expect(method).toBeInstanceOf(AbstractObservedTransactionMethod);
    });

    it('calls the static property Type and it returns the expect value', () => {
        expect(CfxSendTransactionMethod.Type).toEqual('cfx-send-transaction-method');
    });

    it('calls beforeExecution and checks the rpc method', () => {
        method.parameters = ['tx'];

        formatters.inputTransactionFormatter.mockReturnValueOnce('0x0');

        method.beforeExecution(moduleInstanceMock);

        expect(method.parameters[0]).toEqual('0x0');

        expect(formatters.inputTransactionFormatter).toHaveBeenCalledWith('tx', moduleInstanceMock);
    });

    it('calls execute with wallets defined and returns with a resolved promise', (done) => {
        transactionSignerMock.sign = jest.fn(() => {
            return Promise.resolve({rawTransaction: '0x0'});
        });

        moduleInstanceMock.accounts = {wallet: {0: {address: '0x0', privateKey: '0x0'}, accountsIndex: 1}};
        moduleInstanceMock.transactionSigner = transactionSignerMock;

        const transaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        const mappedTransaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        formatters.inputTransactionFormatter.mockReturnValueOnce(mappedTransaction);

        method.callback = (error, hash) => {
            expect(error).toEqual(false);

            expect(hash).toEqual('0x0');

            expect(transactionSignerMock.sign).toHaveBeenCalledWith(mappedTransaction, '0x0');

            expect(formatters.inputTransactionFormatter).toHaveBeenCalledWith(transaction, moduleInstanceMock);

            done();
        };

        method.parameters = [transaction];

        method.execute();
    });

    it('calls execute with wallets defined and returns with a rejected promise', async () => {
        transactionSignerMock.sign = jest.fn(() => {
            return Promise.reject(new Error('ERROR'));
        });

        moduleInstanceMock.accounts = {wallet: {0: {address: '0x0', privateKey: '0x0'}, accountsIndex: 1}};
        moduleInstanceMock.transactionSigner = transactionSignerMock;

        const transaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        const mappedTransaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        formatters.inputTransactionFormatter.mockReturnValueOnce(mappedTransaction);

        method.parameters = [transaction];

        await expect(method.execute()).rejects.toThrow('ERROR');

        expect(transactionSignerMock.sign).toHaveBeenCalledWith(mappedTransaction, '0x0');

        expect(formatters.inputTransactionFormatter).toHaveBeenCalledWith(transaction, moduleInstanceMock);
    });

    it('calls execute with a custom transaction signer defined and returns with a resolved promise', (done) => {
        const customSigner = {constructor: {name: 'CustomSigner'}};

        customSigner.sign = jest.fn(() => {
            return Promise.resolve({rawTransaction: '0x0'});
        });

        moduleInstanceMock.currentProvider = providerMock;
        moduleInstanceMock.accounts = {wallet: {}};
        moduleInstanceMock.transactionSigner = customSigner;

        const transaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        method.parameters = [transaction];

        const mappedTransaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        formatters.inputTransactionFormatter.mockReturnValueOnce(mappedTransaction);

        method.callback = (error, hash) => {
            expect(error).toEqual(false);

            expect(hash).toEqual('0x0');

            expect(customSigner.sign).toHaveBeenCalledWith(mappedTransaction, null);

            expect(formatters.inputTransactionFormatter).toHaveBeenCalledWith(transaction, moduleInstanceMock);

            done();
        };

        method.execute();
    });

    it('calls execute with custom transaction signer defined and returns with a rejected promise', async () => {
        const customSigner = {constructor: {name: 'CustomSigner'}};

        customSigner.sign = jest.fn(() => {
            return Promise.reject(new Error('ERROR'));
        });

        moduleInstanceMock.accounts = {wallet: {0: {address: '0x0', privateKey: '0x0'}, accountsIndex: 1}};
        moduleInstanceMock.transactionSigner = customSigner;

        const transaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        const mappedTransaction = {
            from: 0,
            gas: 1,
            gasPrice: 1,
            nonce: 1,
            chainId: 1
        };

        formatters.inputTransactionFormatter.mockReturnValueOnce(mappedTransaction);

        method.parameters = [transaction];

        await expect(method.execute()).rejects.toThrow('ERROR');

        expect(customSigner.sign).toHaveBeenCalledWith(mappedTransaction, null);

        expect(formatters.inputTransactionFormatter).toHaveBeenCalledWith(transaction, moduleInstanceMock);
    });
});
