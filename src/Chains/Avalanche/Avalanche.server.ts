import Avalanche from "./Avalanche";
import Abi721 from '../../chains/contracts/erc721-abi.json'

class AvalancheServer extends Avalanche {

  async sendPayment(address: string, amount: number, destinTag: string, callback: (status: unknown) => void) {
    console.log('BNB Sending payment...')
    const value = this.toBaseUnit(amount)
    const secret = process.env.AVALANCHE_MINTER_WALLET_SEED
    //const source = process.env.AVALANCHE_MINTER_WALLET
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

  async mintNFT(uri: string, address: string) {
    console.log(this.chain, 'server minting NFT to', address, uri)
    const secret = process.env.AVALANCHE_MINTER_WALLET_SEED
    const acct = this.web3.eth.accounts.privateKeyToAccount(secret)
    const minter = acct.address
    const contract = process.env.NEXT_PUBLIC_AVALANCHE_MINTER_CONTRACT
    const instance = new this.web3.eth.Contract(Abi721, contract)
    const noncex = await this.web3.eth.getTransactionCount(minter, 'latest')
    const nonce = parseInt(noncex)
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
      tokenNum = ' #' + parseInt(info.logs[0].topics[3], 16)
    }
    if (info.status == 1) {
      const tokenId = contract + tokenNum
      const result = { success: true, txid: info?.transactionHash, tokenId }
      console.log('RESULT', result)
      return result
    }
    return { success: false, error: 'Something went wrong' }
  }

}

const AvalancheServerInstance = new AvalancheServer();

export default AvalancheServerInstance