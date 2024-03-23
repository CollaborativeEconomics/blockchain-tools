import Wallet from '@/lib/wallets/metamask'
import { WalletProvider } from '@/types/common'

type Dictionary = { [key:string]:any }
type Callback = (data:Dictionary)=>void

class OptimismSDK{
  enabled  = true
  chain    = 'Optimism'
  symbol   = 'OP'
  logo     = 'op.png'
  network  = process.env.NEXT_PUBLIC_OPTIMISM_NETWORK || ''
  provider:WalletProvider
  mainnet  = {
    id: 10,
    name: 'Optimism Mainnet',
    symbol: 'OP',
    decimals: 18,
    gasprice: '250000000',
    explorer: 'https://optimistic.etherscan.io/',
    rpcurl: 'https://mainnet.optimism.io',
    wssurl: ''
  }
  testnet = {
    id: 11155420,
    name: 'Optimism Testnet', // Sepolia
    symbol: 'OP',
    decimals: 18,
    gasprice: '250000000',
    explorer: 'https://optimism-sepolia.blockscout.com',
    rpcurl: 'https://sepolia.optimism.io',
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

const Optimism = new OptimismSDK()

export default Optimism