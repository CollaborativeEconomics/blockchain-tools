// TODO: This is broken, these empty exports are placeholders
class Contract {
  walletSeed: string;
  constructor({ walletSeed }: { walletSeed: string }) {
    this.walletSeed = walletSeed;
  }
  mint({ to }: { to: string }) {
    console.log("Minting to", to);
    return { success: true, txid: "1234", tokenId: "1234" };
  }
};
const Networks = {
  futurenet: { walletSeed: '' },
  testnet: { walletSeed: '' },
  mainnet: { walletSeed: '' },
};

export { Contract, Networks };