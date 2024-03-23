'use client';

import Avalanche from "./Avalanche";
import Wallet from "@/lib/wallets/metamask";

type Dictionary = { [key: string]: any }
type Callback = (data: Dictionary) => void

class AvalancheClient extends Avalanche {
  wallet = new Wallet(this.provider)

  async connect(callback: Callback) {
    console.log(this.chain, 'connecting...')
    const result = await this.wallet.init(window, this.provider)
    console.log('Metamask session:', result)
    if (result?.address) {
      const data = {
        wallet: 'metamask',
        address: result.address,
        chainid: this.provider.id,
        chain: this.chain,
        currency: this.provider.symbol,
        decimals: this.provider.decimals,
        network: this.network,
        token: '',
        topic: ''
      }
      callback(data)
    }
  }

  async sendPayment(address: string, amount: number, destinTag: string, callback: (data: Dictionary) => void) {
    console.log(this.chain, 'Sending payment...')
    this.connect(async (data) => {
      console.log('Pay connect', data)
      const result = await this.wallet.payment(address, `${amount}`, destinTag)
      callback(result)
    })
  }

}

const AvalancheClientInstance = new AvalancheClient();
export default AvalancheClientInstance;