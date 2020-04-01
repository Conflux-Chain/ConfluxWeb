import * as Utils from 'conflux-web-utils';
import {formatters} from 'conflux-web-core-helpers';
import TransactionSigner from '../../../src/signers/TransactionSigner';

// Mocks
jest.mock('conflux-web-utils');
jest.mock('conflux-web-core-helpers');

/**
 * TransactionSigner test
 */
describe('TransactionSignerTest', () => {
    let transactionSigner;

    beforeEach(() => {
        transactionSigner = new TransactionSigner(Utils, formatters);
    });

    it('constructor check', () => {
        expect(transactionSigner.formatters).toEqual(formatters);

        expect(transactionSigner.utils).toEqual(Utils);
    });
});
