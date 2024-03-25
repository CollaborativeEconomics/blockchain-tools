import Web3 from "web3";
import Abi721 from "@/Contracts/erc721-abi.json";
import Binance from "./common";

class BinanceServer extends Binance {
  web3: Web3

  constructor() {
    super()
    this.provider = this.network == 'mainnet' ? this.mainnet : this.testnet
    this.web3 = new Web3(this.provider.rpcurl)
  }

  async mintNFT(uri: string, address: string) {
    console.log(this.chain, 'server minting NFT to', address, uri)
    const secret = process.env.BINANCE_MINTER_WALLET_SEED || ''
    const acct = this.web3.eth.accounts.privateKeyToAccount(secret)
    const minter = acct.address
    const contract = process.env.NEXT_PUBLIC_BINANCE_MINTER_CONTRACT || ''
    const instance = new this.web3.eth.Contract(Abi721, contract)
    const noncex = await this.web3.eth.getTransactionCount(minter, 'latest')
    const nonce = Number(noncex)
    console.log('MINTER', minter)
    console.log('NONCE', nonce)
    const data = instance.methods.safeMint(address, uri).encodeABI()
    console.log('DATA', data)
    const gasPrice = await this.fetchLedger('eth_gasPrice', [])
    console.log('GAS', parseInt(gasPrice, 16), gasPrice)
    const checkGas = await this.fetchLedger('eth_estimateGas', [{ from: minter, to: contract, data }])
    console.log('EST', parseInt(checkGas, 16), checkGas)
    const gas = { gasPrice: this.provider.gasprice, gasLimit: 275000 }

    const tx = {
      from: minter, // minter wallet
      to: contract, // contract address
      value: '0',   // this is the value in wei to send
      data: data,   // encoded method and params
      gas: gas.gasLimit,
      gasPrice: gas.gasPrice,
      nonce
    }
    console.log('TX', tx)

    const sign = await this.web3.eth.accounts.signTransaction(tx, secret)
    const info = await this.web3.eth.sendSignedTransaction(sign.rawTransaction)
    console.log('INFO', info)
    const hasLogs = info.logs.length > 0
    let tokenNum = ''
    if (hasLogs) {
      console.log('LOGS.0', JSON.stringify(info?.logs[0].topics, null, 2))
      console.log('LOGS.1', JSON.stringify(info?.logs[1].topics, null, 2))
      tokenNum = ' #' + parseInt((info.logs[0] as any).topics[3] || '0', 16)
    }
    if (info.status == 1) {
      const tokenId = contract + tokenNum
      const result = { success: true, txid: info?.transactionHash, tokenId }
      console.log('RESULT', result)
      return result
    }
    return { success: false, error: 'Something went wrong' }
  }

  async createSellOffer(tokenId: string, destinationAddress: string, offerExpirationDate?: string) {
    console.log('Creating sell offer', tokenId, destinationAddress);
    // TODO: Implementation for creating a sell offer
    throw new Error("createSellOffer method not implemented.");
  }

  async sendPayment(address: string, amount: number, destinTag: string, callback: any) {
    console.log('BNB Sending payment...')
    const value = this.toBaseUnit(amount)
    const secret = process.env.BINANCE_MINTER_WALLET_SEED || ''
    //const source = process.env.BINANCE_MINTER_WALLET
    const acct = this.web3.eth.accounts.privateKeyToAccount(secret)
    const source = acct.address
    const nonce = await this.web3.eth.getTransactionCount(source, 'latest')
    const memo = this.strToHex(destinTag)
    const tx = {
      from: source, // minter wallet
      to: address,  // receiver
      value: value, // value in wei to send
      data: memo    // memo initiative id
    }
    console.log('TX', tx)
    const signed = await this.web3.eth.accounts.signTransaction(tx, secret)
    const result = await this.web3.eth.sendSignedTransaction(signed.rawTransaction)
    console.log('RESULT', result)
    //const txHash = await this.fetchLedger({method: 'eth_sendTransaction', params: [tx]})
    //console.log({txHash});
  }
}

const BinanceServerInstance = new BinanceServer();
export default BinanceServerInstance;
