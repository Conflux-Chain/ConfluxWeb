// FIXME: not to depend on 'web3-eth-abi' and 'ethers'
const web3Abi = require('web3-eth-abi');
const { defaultAbiCoder: ethAbi } = require('ethers/utils/abi-coder');

/**
 * @memberOf Contract
 */
class Called {
  constructor(method, { to, data }) {
    this.method = method;
    this.to = to;
    this.data = data;
  }

  /**
   * Will send a transaction to the smart contract and execute its method.
   * set contract.address as `to`,
   * set contract method encode as `data`.
   *
   * > Note: This can alter the smart contract state.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @return {Promise<PendingTransaction>} The PendingTransaction object.
   */
  sendTransaction(options) {
    return this.method.cfx.sendTransaction({
      to: this.to,
      data: this.data,
      ...options,
    });
  }

  /**
   * Executes a message call or transaction and returns the amount of the gas used.
   * set contract.address as `to`,
   * set contract method encode as `data`.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @return {Promise<number>} The used gas for the simulated call/transaction.
   */
  estimateGas(options) {
    return this.method.cfx.estimateGas({
      to: this.to,
      data: this.data,
      ...options,
    });
  }

  /**
   * Executes a message call transaction,
   * set contract.address as `to`,
   * set contract method encode as `data`.
   *
   * > Note: Can not alter the smart contract state.
   *
   * @param options {object} - See `Transaction.callOptions`.
   * @param epochNumber {string|number} - See `Conflux.call`.
   * @return {Promise<*>} Decoded contact call return.
   */
  async call(options, epochNumber) {
    const result = await this.method.cfx.call(
      {
        to: this.to,
        data: this.data,
        ...options,
      },
      epochNumber,
    );
    return this.method.decode(result);
  }

  async then(resolve, reject) {
    try {
      const result = await this.call();
      resolve(result);
    } catch (e) {
      reject(e);
    }
  }
}

class Method extends Function {
  constructor(cfx, { contract, abi }) {
    super();
    this.cfx = cfx;
    this.contract = contract;
    this.abi = abi;
    this.code = web3Abi.encodeFunctionSignature(this.abi);
    return new Proxy(this, this.constructor);
  }

  static apply(self, _, params) {
    return new Called(self, {
      to: self.contract.address,
      data: self.encode(params),
    });
  }

  params(data) {
    if (!data.startsWith(this.code)) {
      return undefined;
    }
    const hex = `0x${data.slice(this.code.length)}`;
    const decode = ethAbi.decode(this.abi.inputs, hex);
    return [...decode];
  }

  encode(params) {
    return this.code + web3Abi.encodeParameters(this.abi.inputs, params).replace('0x', '');
  }

  decode(hex) {
    const decode = ethAbi.decode(this.abi.outputs, hex);
    const outputs = [...decode];
    return outputs.length <= 1 ? outputs[0] : outputs;
  }
}

class Constructor extends Method {
  constructor(cfx, { code, ...rest }) {
    super(cfx, rest);
    this.code = code;
  }

  static apply(self, _, params) {
    return new Called(self, {
      data: self.encode(params),
    });
  }

  encode(params) {
    if (!this.code) {
      throw new Error('contract.constructor.code is empty');
    }
    return this.code + web3Abi.encodeParameters(this.abi.inputs, params).replace('0x', '');
  }

  decode(hex) {
    return hex;
  }
}

/**
 * Contract with all its methods and events defined in its abi.
 */
class Contract {
  /**
   *
   * @param cfx {Conflux} - Conflux instance.
   * @param options {object}
   * @param options.abi {array} - The json interface for the contract to instantiate
   * @param [options.address] {string} - The address of the smart contract to call, can be added later using `contract.address = '0x1234...'`
   * @param [options.code] {string} - The byte code of the contract, can be added later using `contract.constructor.code = '0x1234...'`
   * @return {object}
   *
   * @example
   * > const contract = cfx.Contract({ abi, code });
   * > contract instanceof Contract;
   true

   * > contract.abi; // input abi
   [{type:'constructor', inputs:[...]}, ...]

   * > contract.constructor.code; // input code
   "0x6080604052600080..."

   * // deploy a contract by send constructor then wait and get contract address by `PendingTransaction.deployed` trick.
   * > await contract.constructor(100).sendTransaction({ from: account }).deployed();
   "0xc3ed1a06471be1d3bcd014051fbe078387ec0ad8"

   * @example
   * > const contract = cfx.Contract({ abi, address });
   * > contract.address
   "0xc3ed1a06471be1d3bcd014051fbe078387ec0ad8"

   * > await contract.count(); // call a method without parameter, get decoded return value.
   BigNumber { _hex: '0x64' }
   * > await contract.inc(1); // call a method with parameters, get decoded return value.
   BigNumber { _hex: '0x65' }
   * > await contract.count().call({ from: account }); // call a method from a account.
   BigNumber { _hex: '0x64' }
   * > await contract.count().estimateGas();
   21655
   * > await contract.count().estimateGas({ from: ADDRESS, nonce: 68 }); // if from is a address string, nonce is required
   21655

   * // send transaction from account instance, then wait till confirmed, and get receipt.
   * > await contract.inc(1)
   .sendTransaction({ from: account1 })
   .confirmed({ threshold: 0.01, timeout: 30 * 1000 });
   {
     "blockHash": "0xba948c8925f6d7f14faf540c3b9e6d24d33c78168b2dd81a6021a50949d9f0d7",
     "index": 0,
     "transactionHash": "0x8a5f48c2de0f1bdacfe90443810ad650e4b327a0d19ce49a53faffb224883e42",
     "outcomeStatus": 0,
     ...
   }

   * > await contract.count(); // data in block chain changed by transaction.
   BigNumber { _hex: '0x65' }
   */
  constructor(cfx, { abi: contractABI, address, code }) {
    this.abi = contractABI; // XXX: Create a method named `abi` in solidity is a `Warning`.
    this.address = address; // XXX: Create a method named `address` in solidity is a `ParserError`

    contractABI.forEach((methodABI) => {
      switch (methodABI.type) {
        case 'constructor':
          // cover this.constructor
          this.constructor = new Constructor(cfx, { contract: this, abi: methodABI, code });
          break;

        case 'function':
          this[methodABI.name] = new Method(cfx, { contract: this, abi: methodABI });
          break;

        case 'event':
          // TODO
          break;

        default:
          break;
      }
    });
  }
}

module.exports = Contract;
module.exports.Constructor = Constructor;
module.exports.Method = Method;
module.exports.Called = Called;