'use client';

import { Xumm } from "xumm";
import Ripple from "./Ripple";
import type { XummJsonTransaction, XummPostPayloadBodyJson, PayloadAndSubscription } from 'xumm-sdk/dist/src/types'


type Dictionary = { [key: string]: any }

const apikey = process.env.NEXT_PUBLIC_XUMM_API_KEY || ''
const secret = process.env.XUMM_API_SECRET || ''

class RippleClient extends Ripple {
  wallet = new Xumm(apikey, secret)

  async connect(callback: (data: Dictionary) => void) {
    console.log('XRP Connecting...')
    this.wallet.authorize().then((state) => {
      console.log('Xumm Authorized', state)
      if (!state) {
        console.log('Error: no state')
        return
      }
      if ('me' in state) {
        const flow = state
        const user = state.me
        const address = user.account
        //const network = user.networkType.toLowerCase()
        const network = 'testnet'
        const token = flow.jwt
        const data = {
          wallet: 'xumm',
          address: address,
          chain: this.chain,
          chaindid: '',
          currency: this.symbol,
          network: network,
          token: token,
          topic: ''
        }
        callback(data)
      } else {
        console.log('Error', state)
        return
      }
    }).catch((ex) => {
      console.log('Error', ex)
    })
  }

  async sendPayment(address: string, amount: number, destinTag: string, callback: (data: Dictionary) => void) {
    console.log('XRP Sending payment...', address, amount, destinTag)
    const request: XummJsonTransaction = {
      TransactionType: 'Payment',
      Destination: address,
      Amount: String(amount * 1000000) // one million drops, 1 XRP
    }
    if (destinTag) { request.DestinationTag = destinTag }
    //this.sendPayload(request, callback)
    if (!this.wallet.payload) {
      throw new Error('Xumm wallet not initialized');
    }
    this.wallet.payload.createAndSubscribe(request, (event) => {
      if (Object.keys(event.data).indexOf('opened') > -1) {
        // Update the UI? The payload was opened.
        console.log('OPENED')
      }
      if (Object.keys(event.data).indexOf('signed') > -1) {
        // The `signed` property is present, true (signed) / false (rejected)
        console.log('SIGNED', event.data.signed)
        return event
      }
    }).then(payload => {
      console.log('CREATED', payload)
      // @ts-ignore: I hate types
      console.log('Payload URL:', payload?.created.next.always)
      // @ts-ignore: I hate types
      console.log('Payload QR:', payload?.created.refs.qr_png)
      // @ts-ignore: I hate types
      return payload.resolved // Return payload promise for the next `then`
    }).then((payload) => {
      console.log('RESOLVED')
      console.log('Payload resolved', payload)
      if (Object.keys(payload.data).indexOf('signed') > -1) {
        const approved = payload.data.signed
        console.log(approved ? 'APPROVED' : 'REJECTED')
        if (approved) {
          callback({ success: true, txid: payload.data.txid })
        } else {
          callback({ success: false, txid: '' })
        }
      }
    }).catch((ex) => {
      console.log('ERROR', ex)
      callback({ success: false, txid: '', error: 'Error sending payment: ' + ex })
    })
    // This is where you can do `xumm.payload.get(...)` to fetch details
    console.log('----DONE')
  }

}

const RippleClientInstance = new RippleClient();
export default RippleClientInstance;