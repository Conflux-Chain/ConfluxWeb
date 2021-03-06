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

import * as Utils from 'conflux-web-utils';
import {formatters} from 'conflux-web-core-helpers';
import MethodFactory from './factories/MethodFactory';
import AccountsModule from './Accounts';

/**
 * Returns the Accounts object
 *
 * @param {ConfluxWebCfxProvider|HttpProvider|WebsocketProvider|IpcProvider|String} provider
 * @param {Object} options
 * @param {Net.Socket} net
 *
 * @returns {Accounts}
 * @constructor
 */
export function Accounts(provider, net = null, options = {}) {
    return new AccountsModule(provider, Utils, formatters, new MethodFactory(Utils, formatters), options, net);
}
