import * as Utils from 'conflux-web-utils';
import {formatters} from 'conflux-web-core-helpers';
import {AbstractConfluxWebModule} from 'conflux-web-core';
import Network from '../../src/Network';

// Mocks
jest.mock('conflux-web-utils');
jest.mock('conflux-web-core-helpers');

/**
 * Network test
 */
describe('NetworkTest', () => {
    let network, providerMock, methodFactoryMock;

    beforeEach(() => {
        providerMock = {send: jest.fn(), clearSubscriptions: jest.fn()};
        methodFactoryMock = {
            hasMethod: () => {
                return false;
            }
        };

        network = new Network(providerMock, methodFactoryMock, Utils, formatters, {}, {});
    });

    it('constructor check', () => {
        expect(network.utils).toEqual(Utils);

        expect(network.formatters).toEqual(formatters);

        expect(network).toBeInstanceOf(AbstractConfluxWebModule);
    });

    it('calls getNetworkType and resolves to the network name "private', async () => {
        const callback = jest.fn();

        network.getId = jest.fn(() => {
            return Promise.resolve(0);
        });

        await expect(network.getNetworkType(callback)).resolves.toEqual('private');

        expect(callback).toHaveBeenCalledWith(null, 'private');

        expect(network.getId).toHaveBeenCalled();
    });

    it('calls getNetworkType and resolves to the network name "main', async () => {
        const callback = jest.fn();

        network.getId = jest.fn(() => {
            return Promise.resolve(1);
        });

        await expect(network.getNetworkType(callback)).resolves.toEqual('main');

        expect(callback).toHaveBeenCalledWith(null, 'main');

        expect(network.getId).toHaveBeenCalled();
    });

    it('calls getNetworkType and resolves to the network name "morden', async () => {
        const callback = jest.fn();

        network.getId = jest.fn(() => {
            return Promise.resolve(2);
        });

        await expect(network.getNetworkType(callback)).resolves.toEqual('morden');

        expect(callback).toHaveBeenCalledWith(null, 'morden');

        expect(network.getId).toHaveBeenCalled();
    });

    it('calls getNetworkType and resolves to the network name "ropsten', async () => {
        const callback = jest.fn();

        network.getId = jest.fn(() => {
            return Promise.resolve(3);
        });

        await expect(network.getNetworkType(callback)).resolves.toEqual('ropsten');

        expect(callback).toHaveBeenCalledWith(null, 'ropsten');

        expect(network.getId).toHaveBeenCalled();
    });

    it('calls getNetworkType and resolves to the network name "rinkeby', async () => {
        const callback = jest.fn();

        network.getId = jest.fn(() => {
            return Promise.resolve(4);
        });

        await expect(network.getNetworkType(callback)).resolves.toEqual('rinkeby');

        expect(callback).toHaveBeenCalledWith(null, 'rinkeby');

        expect(network.getId).toHaveBeenCalled();
    });

    it('calls getNetworkType and resolves to the network name "kovan', async () => {
        const callback = jest.fn();

        network.getId = jest.fn(() => {
            return Promise.resolve(42);
        });

        await expect(network.getNetworkType(callback)).resolves.toEqual('kovan');

        expect(callback).toHaveBeenCalledWith(null, 'kovan');

        expect(network.getId).toHaveBeenCalled();
    });

    it('calls getNetworkType and rejects the promise', async () => {
        const callback = jest.fn();

        network.getId = jest.fn(() => {
            return Promise.reject(new Error('ERROR'));
        });

        await expect(network.getNetworkType(callback)).rejects.toEqual(new Error('ERROR'));

        expect(callback).toHaveBeenCalledWith(new Error('ERROR'), null);

        expect(network.getId).toHaveBeenCalled();
    });
});
