import ChainInstance, { Chain, ChainSymbol } from "../ChainInstance";

export const rippleMainnet = {
  id: 1,
  name: 'Mainnet',
  symbol: 'XRP',
  decimals: 6,
  gasprice: '0',
  explorer: 'https://xrpscan.com/tx/',
  rpcurl: 'https://s1.ripple.com:51234',
  wssurl: 'wss://s1.ripple.com'
}

export const rippleTestnet = {
  id: 2,
  name: 'Testnet',
  symbol: 'XRP',
  decimals: 6,
  gasprice: '0',
  explorer: 'https://test.bithomp.com/explorer/',
  rpcurl: 'https://s.altnet.rippletest.net:51234',
  wssurl: 'wss://s.altnet.rippletest.net'
}

class Ripple extends ChainInstance {
  chain: Chain = 'XRPL'
  symbol: ChainSymbol = 'XRP'
  logo = 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png?1605778731'
  network = process.env.NEXT_PUBLIC_XRPL_NETWORK!
  mainnet = rippleMainnet
  testnet = rippleTestnet
  provider = process.env.NEXT_PUBLIC_XRPL_NETWORK === 'mainnet' ? this.mainnet : this.testnet
  constructor() {
    super();
  }
  async getTransactionInfo(txid: string) {
    console.log('Get tx info by txid', txid)
    const txResponse = await this.fetchLedger(
      'tx', [
      {
        transaction: txid,
        binary: false
      }
    ]
    )
    if (!txResponse || 'error' in txResponse) {
      console.log('ERROR: Exception occured while retrieving transaction info', txid)
      return { error: 'Exception occured while retrieving transaction info' }
    }
    if (
      txResponse?.result?.validated === undefined &&
      txResponse?.result?.validated
    ) {
      console.log('ERROR', 'Transaction is not validated on ledger')
      return { error: 'Transaction is not validated on ledger' }
    }
    //console.log('TXINFO', txResponse)
    const result = {
      success: true,
      account: txResponse.result.Account,
      amount: txResponse.result.Amount > 0 ? txResponse.result.Amount / 1000000 : txResponse.result.Amount,
      destination: txResponse.result.Destination,
      destinationTag: txResponse.result.DestinationTag
    }
    return result
  }
  findOffer(txInfo: any) {
    for (var i = 0; i < txInfo.result.meta.AffectedNodes.length; i++) {
      let node = txInfo.result.meta.AffectedNodes[i]
      if (node.CreatedNode && node.CreatedNode.LedgerEntryType == 'NFTokenOffer') {
        return node.CreatedNode.LedgerIndex
      }
    }
  }
  fromBaseUnit(amount: number) {
    const sats = 10 ** this.provider.decimals
    return amount / sats
  }
  toBaseUnit(amount: number) {
    const sats = 10 ** this.provider.decimals
    return amount * sats
  }
  async fetchLedger(method: string, params: unknown) { // TODO: what's the actual type of payload?
    const payload = {
      method, params
    }
    try {
      let url = this.provider.rpcurl
      let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
      let result = await fetch(url, options)
      let data = await result.json()
      return data
    } catch (ex) {
      console.error(ex)
      if (ex instanceof Error) {
        return { error: ex.message }
      }
    }
  }
  findToken(txInfo: any) {
    let found = null
    for (var i = 0; i < txInfo.result.meta.AffectedNodes.length; i++) {
      let node = txInfo.result.meta.AffectedNodes[i]
      if (node.ModifiedNode && node.ModifiedNode.LedgerEntryType == 'NFTokenPage') {
        let m = node.ModifiedNode.FinalFields.NFTokens.length
        let n = node.ModifiedNode.PreviousFields.NFTokens.length
        for (var j = 0; j < m; j++) {
          let tokenId = node.ModifiedNode.FinalFields.NFTokens[j].NFToken.NFTokenID
          found = tokenId
          for (var k = 0; k < n; k++) {
            if (tokenId == node.ModifiedNode.PreviousFields.NFTokens[k].NFToken.NFTokenID) {
              found = null
              break
            }
          }
          if (found) { break }
        }
      }
      if (found) { break }
    }
    return found
  }
};

export default Ripple;
