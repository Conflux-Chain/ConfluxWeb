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
import {isBloom} from 'conflux-web-utils';

// $ExpectType boolean
isBloom('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');

// $ExpectError
isBloom(656);
// $ExpectError
isBloom(new BN(3));
// $ExpectError
isBloom(['string']);
// $ExpectError
isBloom([4]);
// $ExpectError
isBloom({});
// $ExpectError
isBloom(true);
// $ExpectError
isBloom(null);
// $ExpectError
isBloom(undefined);
