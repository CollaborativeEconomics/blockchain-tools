import ChainInstance, { Chain, ChainSymbol } from "../ChainInstance";

export const mainnetConfig = {
  id: 0,
  name: 'Stellar Mainnet',
  symbol: 'XLM',
  decimals: 6,
  gasprice: '250000000',
  explorer: 'https://stellarchain.io',
  rpcurl: 'https://horizon.stellar.org',
  wssurl: ''
};

export const testnetConfig = {
  id: 0,
  name: 'Stellar Testnet',
  symbol: 'XLM',
  decimals: 6,
  gasprice: '250000000',
  explorer: 'https://testnet.stellarchain.io',
  rpcurl: 'https://horizon-testnet.stellar.org',
  wssurl: ''
};

export const futurenetConfig = {
  id: 0,
  name: 'Stellar Futurenet',
  symbol: 'XLM',
  decimals: 6,
  explorer: '',
  rpcurl: 'https://horizon-futurenet.stellar.org',
  soroban: 'https://rpc-futurenet.stellar.org',
  phrase: 'Test SDF Future Network ; October 2022',
  wssurl: ''
}

const networkMap = {
  mainnet: mainnetConfig,
  testnet: testnetConfig,
  futurenet: futurenetConfig
}

class Stellar extends ChainInstance {
  network: 'mainnet' | 'testnet' | 'futurenet' = 'mainnet';
  chain: Chain = 'Stellar';
  symbol: ChainSymbol = 'XLM';
  logo = 'xlm.png';
  mainnet = mainnetConfig;
  testnet = testnetConfig;
  futurenet = futurenetConfig;

  constructor({ network }) {
    super();
    this.network = network;
    this.provider = networkMap[network];
  }

  async getTransactionInfo(txid: string): Promise<unknown> {
    console.log('Get tx info by txid', txid);
    let txInfo = await this.fetchLedger('GET', '/transactions/' + txid)
    if (!txInfo || 'error' in txInfo) {
      console.log('ERROR', 'Transaction not found:', txid)
      return { error: 'Transaction not found' }
    }
    if (!txInfo?.successful) {
      console.log('ERROR', 'Transaction not valid')
      return { error: 'Transaction not valid' }
    }
    console.log('TXINFO', txInfo)
    const tag = txInfo.memo?.indexOf(':') > 0 ? txInfo.memo?.split(':')[1] : ''
    const opid = (BigInt(txInfo.paging_token) + BigInt(1)).toString()
    const opInfo = await this.fetchLedger('GET', '/operations/' + opid)
    const result = {
      success: true,
      account: txInfo.source_account,
      amount: opInfo?.amount,
      destination: opInfo?.to,
      destinationTag: tag
    }
    return result
  }

  findOffer(txInfo: any): unknown {
    throw new Error("FIND_OFFER_ method not yet implemented.");
  }

  fromBaseUnit(amount: number): number {
    const wei = 10 ** this.provider.decimals
    return amount / wei
  }

  toBaseUnit(amount: number): number {
    const wei = 10 ** this.provider.decimals
    return amount * wei
  }

  async fetchLedger(method: string, query: string) {
    try {
      let url = this.provider.rpcurl + query
      console.log('FETCH', url)
      let options = {

        method,

        headers: { 'Content-Type': 'application/json' }
      }
      let result = await fetch(url, options)
      let data = await result.json()
      return data
    } catch (ex: any) {
      console.error(ex)
      return { error: ex.message }
    }
  }

  findToken(tokenId: string): unknown {
    throw new Error("FIND_TOKEN_ method not yet implemented.");
  }
};

export default Stellar;
