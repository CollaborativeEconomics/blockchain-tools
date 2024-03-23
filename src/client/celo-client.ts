import Wallet from '@/lib/wallets/metamask'
import { WalletProvider } from '@/types/common'

type Dictionary = { [key:string]:any }
type Callback = (data:Dictionary)=>void

class CeloSDK{
  enabled  = true
  chain    = 'Celo'
  symbol   = 'CELO'
  logo     = 'celo.png'
  network  = process.env.NEXT_PUBLIC_CELO_NETWORK || ''
  provider:WalletProvider
  mainnet  = {
    id: 42220,
    name: 'Celo Mainnet',
    symbol: 'CELO',
    decimals: 18,
    gasprice: '10000000000',
    explorer: 'https://explorer.celo.org',
    rpcurl: 'https://forno.celo.org',
    wssurl: ''
  }
  testnet = {
    id: 44787,
    name: 'Celo Testnet',
    symbol: 'CELO',
    decimals: 18,
    gasprice: '10000000000',
    explorer: 'https://alfajores-blockscout.celo-testnet.org',
    rpcurl: 'https://alfajores-forno.celo-testnet.org',
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

const Celo = new CeloSDK()

export default Celo