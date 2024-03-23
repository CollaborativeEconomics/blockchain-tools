import Wallet from '@/lib/wallets/metamask'
import { WalletProvider } from '@/types/common'

type Dictionary = { [key:string]:any }
type Callback = (data:Dictionary)=>void

class XinfinSDK{
  enabled  = true
  chain    = 'XinFin'
  symbol   = 'XDC'
  logo     = 'xdc.png'
  network  = process.env.NEXT_PUBLIC_XINFIN_NETWORK || ''
  provider:WalletProvider
  mainnet  = {
    id: 50,
    name: 'Xinfin Mainnet',
    symbol: 'XDC',
    decimals: 18,
    gasprice: '250000000',
    explorer: 'https://explorer.xinfin.network',
    rpcurl: 'https://rpc.xinfin.network',
    wssurl: ''
  }
  testnet = {
    id: 51,
    name: 'Xinfin Testnet',
    symbol: 'XDC',
    decimals: 18,
    gasprice: '250000000',
    explorer: 'https://explorer.apothem.network',
    rpcurl: 'https://rpc.apothem.network',
    wssurl: ''
  }
  wallet:Wallet

  constructor(){
    this.provider = this.network=='mainnet' ? this.mainnet : this.testnet
    this.wallet = new Wallet(this.provider)
  }

  toWei(num:number){
    const sats = 10**this.provider.decimals
    return num / sats
  }

  async connect(callback:Callback){
    console.log(this.chain, 'connecting...')
    const result = await this.wallet.init(window, this.provider)
    console.log('Metamask session:', result)
    if(result?.address){
      const data = {
        wallet:   'metamask',
        address:  result.address,
        chainid:  this.provider.id,
        chain:    this.chain,
        currency: this.provider.symbol,
        decimals: this.provider.decimals,
        network:  this.network,
        token:    '',
        topic:    ''
      }
      callback(data)
    }
  }

  async sendPayment(address:string, amount:string, destinTag:string, callback:any){
    console.log(this.chain, 'Sending payment...')
    this.connect(async (data) => {
      console.log('Pay connect', data)
      const result = await this.wallet.payment(address, amount, destinTag)
      callback(result)
    })
  }

  async mintNFT(uri: string){
    console.log(this.chain, 'Minting NFT...')
    console.log('Not implemented on the client')
  }

  async getTransactionInfo(txid:string){
    console.log('Get tx info by txid', txid)
    const info = await this.wallet.getTransactionInfo(txid)
    return info
  }
}

const Xinfin = new XinfinSDK()

export default Xinfin