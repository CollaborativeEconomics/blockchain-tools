import Ripple from "./Ripple";
import { Client, NFTokenCreateOffer, NFTokenCreateOfferFlags, NFTokenMintFlags, Wallet, convertStringToHex, isoTimeToRippleTime } from "xrpl";

class RippleServer extends Ripple {

  // Mints NFT and returns tokenId
  //   uri: uri to metadata
  //   taxon: same id for all similar nfts
  async mintNFT(uri: string, donor: string, taxon: number, transfer: boolean = false) {
    console.log('XRP Minting NFT...', uri, donor)
    let client = null
    let sourceTag = parseInt(process.env.XRPL_SOURCE_TAG || '77777777')
    if (!taxon) { taxon = 123456000 }
    try {
      let wallet = Wallet.fromSeed(process.env.XRPL_MINTER_WALLET_SEED!)
      let account = wallet.classicAddress
      console.log('ADDRESS', account)
      let flags = NFTokenMintFlags.tfBurnable + NFTokenMintFlags.tfOnlyXRP
      let nftUri = convertStringToHex(uri)
      if (transfer) { flags += NFTokenMintFlags.tfTransferable }
      let tx = {
        TransactionType: 'NFTokenMint',
        Account: account,
        URI: nftUri,          // uri to metadata
        NFTokenTaxon: taxon,  // id for all nfts minted by us
        Flags: flags,         // burnable, onlyXRP, non transferable
        SourceTag: sourceTag, // 77777777
      }
      //if(destinTag){ tx.DestinationTag = destinTag }
      console.log('TX', tx)
      client = new Client(this.provider.wssurl) as any // TODO: get xrpl types, why don't they have?
      await client.connect()
      let txInfo = await client.submitAndWait(tx, { wallet })
      console.log('Result:', txInfo?.result?.meta?.TransactionResult)
      if (txInfo?.result?.meta?.TransactionResult == 'tesSUCCESS') {
        //console.log('TXINFO', JSON.stringify(txInfo))
        let tokenId = this.findToken(txInfo)
        console.log('TokenId:', tokenId)
        return { success: true, tokenId }
      }
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : JSON.stringify(ex)
      console.error(ex)
      return { success: false, error: 'Error minting NFT: ' + message }
    } finally {
      client?.disconnect()
    }
  }

  // Creates a sell offer
  //   tokenId: nft that will be offered
  //   destinAcct: address that will approve the offer
  //   expires: optional date if offer will expire
  async createSellOffer(tokenId: string, destinationAddress: string, offerExpirationDate?: string) {
    console.log('XRP Sell offer', tokenId, destinationAddress)
    let client = null
    try {
      console.log('SEED', process.env.XRPL_MINTER_WALLET_SEED)
      let wallet = Wallet.fromSeed(process.env.XRPL_MINTER_WALLET_SEED!)
      let account = wallet.classicAddress
      console.log('ACT', account)
      let tx = {
        TransactionType: 'NFTokenCreateOffer',
        Account: account,
        NFTokenID: tokenId,
        Destination: destinationAddress,
        Amount: '0',  // Zero price as it is a transfer
        Flags: NFTokenCreateOfferFlags.tfSellNFToken // sell offer
      } as NFTokenCreateOffer
      if (offerExpirationDate) {
        tx.Expiration = isoTimeToRippleTime(offerExpirationDate) // must be Ripple epoch
      }
      console.log('TX', tx)
      console.log('WSS', this.provider.wssurl)
      client = new Client(this.provider.wssurl)
      await client.connect()
      let txInfo = await client.submitAndWait(tx, { wallet })
      console.log('Result:', txInfo?.result?.meta?.TransactionResult)
      if (txInfo?.result?.meta?.TransactionResult == 'tesSUCCESS') {
        let offerId = this.findOffer(txInfo)
        console.log('OfferId', offerId)
        return { success: true, offerId }
      } else {
        return { error: 'Failure creating sell offer' }
      }
    } catch (ex) {
      console.error(ex)
      return { error: 'Error creating sell offer' }
    } finally {
      client?.disconnect()
    }
  }

}

const RippleServerInstance = new RippleServer()
export default RippleServerInstance