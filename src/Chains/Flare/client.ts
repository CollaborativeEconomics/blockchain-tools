"use client";

import Wallet from "@/Wallets/metamask";
import Flare from "./common";

class FlareClient extends Flare {
  constructor({ network } = { network: "mainnet" }) {
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
    callback: (data: Record<string, any>) => void,
  ) {
    console.log(this.chain, "Sending payment...");
    this.connect(async (data) => {
      console.log("Pay connect", data);
      const result = await this.wallet.payment(address, amount, destinTag);
      callback(result);
    });
  }
}

export default FlareClient;
