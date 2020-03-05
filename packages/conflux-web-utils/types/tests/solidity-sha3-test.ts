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

import BN = require('bn.js');
import {soliditySha3} from 'conflux-web-utils';

// $ExpectType string
soliditySha3('234564535', '0xfff23243', true, -10);
// $ExpectType string
soliditySha3('Hello!%');
// $ExpectType string
soliditySha3('234');
// $ExpectType string
soliditySha3(0xea);
// $ExpectType string
soliditySha3(new BN(3));
// $ExpectType string
soliditySha3({type: 'uint256', value: '234'});
// $ExpectType string
soliditySha3({t: 'uint', v: new BN('234')});
// $ExpectType string
soliditySha3({t: 'string', v: 'Hello!%'}, {t: 'int8', v: -23}, {t: 'address', v: '0x85F43D8a49eeB85d32Cf465507DD71d507100C1d'});
// $ExpectType string
soliditySha3('0x407D73d8a49eeb85D32Cf465507dd71d507100c1');

// $ExpectError
soliditySha3(['hey']);
// $ExpectError
soliditySha3([34]);
// $ExpectError
soliditySha3(null);
// $ExpectError
soliditySha3(undefined);