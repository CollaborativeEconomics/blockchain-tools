"use client";

import Wallet from "@/wallets/metamask";
import Binance from "./common";

type Dictionary = { [key: string]: any };

class BinanceClient extends Binance {
  constructor({ network = "mainnet" } = { network: "mainnet" }) {
    super();
    this.network = network;
    this.provider = network === "mainnet" ? this.mainnet : this.testnet;
    this.wallet = new Wallet(this.provider);
  }

  async connect(callback: (options: Record<string, any>) => void) {
    console.log(this.chain, "connecting...");
    const result = await this.wallet.init(window, this.provider);
    console.log("Metamask session:", result);
    if (result?.address) {
      const data = {
        wallet: "metamask",
        address: result.address,
        chainid: this.provider.id,
        chain: this.chain,
        currency: this.provider.symbol,
        decimals: this.provider.decimals,
        network: this.network,
        token: "",
        topic: "",
      };
      callback(data);
    }
  }

  async sendPayment(
    address: string,
    amount: number,
    destinTag: string,
    callback: (data: Dictionary) => void,
  ) {
    console.log(this.chain, "Sending payment...");
    this.connect(async (data) => {
      console.log("Pay connect", data);
      const result = await this.wallet.payment(address, amount, destinTag);
      callback(result);
    });
  }

  // not needed, as we have a common implementation
  // async getTransactionInfo(txid:string){
  //   console.log('Get tx info by txid', txid)
  //   const info = await this.wallet.getTransactionInfo(txid)
  //   return info
  // }
}

export default BinanceClient;
