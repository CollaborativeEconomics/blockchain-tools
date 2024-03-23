import Wallet from "@/lib/wallets/metamask";
import ChainInstance, { Chain, ChainSymbol } from "../ChainInstance";
import Web3 from "web3";

export const avalancheMainnet = {
  id: 43114,
  name: 'Avalanche Mainnet',
  symbol: 'AVAX',
  decimals: 18,
  gasprice: '250000000',
  explorer: 'https://snowtrace.io', //https://cchain.explorer.avax.network
  rpcurl: 'https://api.avax.network/ext/bc/C/rpc',
  wssurl: ''
}

export const avalancheTestnet = {
  id: 43113,
  name: 'Avalanche Testnet',
  symbol: 'AVAX',
  decimals: 18,
  gasprice: '250000000',
  explorer: 'https://testnet.snowtrace.io',
  rpcurl: 'https://api.avax-test.network/ext/bc/C/rpc',
  wssurl: ''
}

export default class Avalanche extends ChainInstance {
  chain: Chain = 'Avalanche'
  symbol: ChainSymbol = 'AVAX'
  logo = 'avax.png'
  network = process.env.NEXT_PUBLIC_AVALANCHE_NETWORK!
  provider = avalancheTestnet
  mainnet = avalancheMainnet
  testnet = avalancheTestnet
  web3: any = null;
  constructor() {
    super();
    this.wallet = new Wallet(this.provider)
    this.web3 = new Web3(this.provider.rpcurl)
  }

  async getTransactionInfo(txid: string) {
    console.log('Get tx info by txid', txid)
    const info = await this.wallet.getTransactionInfo(txid)
    return info
  }

  public toBaseUnit(amount: number) {
    const sats = 10 ** this.provider.decimals
    return amount / sats
  }

  public fromBaseUnit(amount: number): number {
    const sats = 10 ** this.provider.decimals
    return amount * sats
  }

  async fetchLedger(method: string, params: any) {
    let data = { id: '1', jsonrpc: '2.0', method, params }
    let body = JSON.stringify(data)
    let opt = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
    try {
      let res = await fetch(this.provider.rpcurl, opt)
      let inf = await res.json()
      return inf?.result
    } catch (ex) {
      console.error(ex)
      if (ex instanceof Error) {
        return { error: ex.message }
      }
    }
  }

  public findOffer(txInfo: any): unknown {
    throw new Error('Method not implemented.');
  }

  public findToken(tokenId: string): unknown {
    throw new Error('Method not implemented.');
  }

  public toHex(str: string): string {
    return '0x' + parseInt(str).toString(16)
  }

  strToHex(str: string) {
    if (!str) { return '' }
    return '0x' + Buffer.from(str.toString(), 'utf8').toString('hex')
  }

  hexToStr(hex: string, encoding: BufferEncoding = 'utf8') {
    if (!hex) { return '' }
    return Buffer.from(hex.substr(2), 'hex').toString(encoding)
  }
};
