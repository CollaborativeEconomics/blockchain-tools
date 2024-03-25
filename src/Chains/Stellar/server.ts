import { Contract, Networks } from '../../Contracts/nft721'
import Stellar from "./common";

class StellarServer extends Stellar {

  async mintNFT(uri: string, donor: string, taxon: number, transfer: boolean = false) {
    console.log(this.chain, 'minting NFT to', donor, uri)
    // const network = this.network == 'futurenet' ? this.futurenet : this.testnet
    const contractConfigMap = {
      futurenet: Networks.futurenet,
      testnet: Networks.testnet,
      mainnet: Networks.futurenet, // TODO: Add mainnet config
    }
    // console.log('NET', network)
    const contract = new Contract(contractConfigMap[this.network])
    //console.log('CTR', contract.spec)
    const info = await contract.mint({ to: donor })
    console.log('OK?', info?.success)
    console.log('TXID', info?.txid)
    console.log('TKID', info?.tokenId)
    if (!info?.success) {
      return info
    }
    return info
  }

  async createSellOffer(tokenId: string, destinationAddress: string, offerExpirationDate?: string) {
    console.log('Creating sell offer', tokenId, destinationAddress);
    // TODO: Implementation for creating a sell offer
    throw new Error("createSellOffer method not implemented.");
  }

  /*
  async mintNFT_OLD(uri: string, address:string):Promise<MintResponse>{
    console.log(this.chain, 'minting NFT to', address, uri)
    try {
      const server  = new StellarSdk.Server(this.provider.rpcurl)
      const minter  = StellarSdk.Keypair.fromSecret(process.env.STELLAR_MINTER_WALLET_SECRET) // GDDMY...
      const issuer  = minter.publicKey()
      const source  = await server.loadAccount(issuer)
      const myNFT   = new StellarSdk.Asset('GIVEXLM', issuer)
      //const phrase  = this.network=='mainnet' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
      const phrase  = StellarSdk.Networks.FUTURENET
      const timeout = 300 // five minutes

      var mintTx = new StellarSdk.TransactionBuilder(source, {
        networkPassphrase: phrase,
        fee: StellarSdk.BASE_FEE
      })

      let mintOp = StellarSdk.Operation.payment({
        source: issuer,
        destination: address,
        asset: myNFT,
        amount: '1'
      })

      let mint = mintTx
        .addOperation(mintOp)
        //.addMemo(StellarSdk.Memo.text(uri))
        .setTimeout(timeout)
        .build()
      
      //console.log('Minting...')
      mint.sign(minter)
      let minted = await server.submitTransaction(mint)
      console.log('Minted', minted)
      if(minted?.successful){
        // StellarSDK interface from server.submitTransaction response without paging_token
        // Clone the result and get the paging_token from there
        const cloned = JSON.parse(JSON.stringify(minted))
        const opid = (BigInt(cloned?.paging_token || '0') + BigInt(1)).toString() // eslint-disable-line
        console.log('Txid', opid)
        return {success:true, tokenId:opid}
      } else {
        //console.log('Error', minted.response?.data?.extras?.result_codes)
        //return {success:false, error:'Error minting '+minted?.response?.data?.extras?.result_codes}
        //console.log('Error?', minted?.response?.data)
        console.log('Error?', minted)
        return {success:false, error:'Error minting NFT'}
      }
    } catch(ex) {
      console.error(ex)
      return {success:false, error:ex.message}
    }
  }
*/
}

export default StellarServer;
