import * as Utils from 'conflux-web-utils';
import {formatters} from 'conflux-web-core-helpers';
import {AbstractConfluxWebModule} from 'conflux-web-core';
import {SignMethod} from 'conflux-web-core-method';
import CfxSignMethod from '../../../src/methods/CfxSignMethod';

// Mocks
jest.mock('conflux-web-utils');
jest.mock('conflux-web-core-helpers');
jest.mock('conflux-web-core');

/**
 * CfxSignMethod test
 */
describe('CfxSignMethodTest', () => {
    let method, moduleInstanceMock, accountsMock;

    beforeEach(() => {
        accountsMock = {};
        accountsMock.sign = jest.fn();
        accountsMock.wallet = {'0x0': {privateKey: '0x0', address: '0x0'}};
        accountsMock.accountsIndex = 1;

        new AbstractConfluxWebModule({}, {}, {}, {});
        moduleInstanceMock = AbstractConfluxWebModule.mock.instances[0];
        moduleInstanceMock.accounts = accountsMock;

        formatters.inputAddressFormatter.mockReturnValue('0x0');
        formatters.inputSignFormatter.mockReturnValue('string');

        method = new CfxSignMethod(Utils, formatters, moduleInstanceMock);
        method.callback = jest.fn();
        method.parameters = ['nope', '0x0'];
    });

    it('constructor check', () => {
        expect(method).toBeInstanceOf(SignMethod);
    });
});
