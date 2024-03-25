import { NetworkProvider } from '@/types/networkProvider';
import { Web3 } from 'web3'

export const chains = {
  AVAX: 'Avalanche',
  BNB: 'Binance',
  CELO: 'Celo',
  EOS: 'EOS',
  ETH: 'Ethereum',
  USDC: 'EthereumUSDC',
  USDT: 'EthereumUSDT',
  FIL: 'Filecoin',
  FLR: 'Flare',
  OP: 'Optimism',
  MATIC: 'Polygon',
  PGN: 'PublicGoods',
  XLM: 'Stellar',
  XRP: 'XRPL',
  XDC: 'XinFin'
} as const
export type Chain = typeof chains[keyof typeof chains];
export type ChainSymbol = keyof typeof chains;

export default abstract class ChainInstance {
  // config
  public abstract chain: Chain
  public abstract symbol: ChainSymbol
  public abstract logo: string
  public network: 'mainnet' | 'testnet' | string = 'mainnet'
  public provider: NetworkProvider = { id: 0, name: '', symbol: '', decimals: 0, gasprice: '', explorer: '', rpcurl: '', wssurl: '' }
  public abstract mainnet: NetworkProvider
  public abstract testnet: NetworkProvider
  public wallet: any = null; // TODO: enumerate wallet classes, then type this

  // isometric functions, must be defined on all subclasses
  public abstract getTransactionInfo(txid: string): unknown;
  public abstract findOffer(txInfo: any): unknown;
  public abstract fromBaseUnit(amount: number): number;
  public abstract toBaseUnit(amount: number): number;
  public abstract fetchLedger(method: unknown, params: unknown): unknown;

  // client functions, only defined on client subclasses
  public connect?(callback: (data: unknown) => void): void { };
  public sendPayment?(address: string, amount: number, destinTag: string, callback: (status: unknown) => void): void { };

  // server functions, only defined on server subclasses
  public web3?: Web3;
  walletSeed?: string; // For minting NFTs and such
  public async mintNFT?(uri: string, donor: string, taxon: number, transfer: boolean, contract: string): Promise<unknown> { return null };
  public async mintNFT1155?(address: string, tokenId: string, uri: string, contract: string): Promise<unknown> { return null };
  public async createSellOffer?(tokenId: string, destinationAddress: string, offerExpirationDate?: string): Promise<unknown> { return null };
}