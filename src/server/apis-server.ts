// SERVER LIBS
import Arbitrum     from './arbitrum'
import Avalanche   from './avalanche'
import Base         from './base'
//import Binance     from './binance'
import Celo        from './celo'
//import EOS         from './eos'
//import Ethereum    from './ethereum'
//import Filecoin    from './filecoin'
import Flare       from './flare'
import Optimism    from './optimism'
import Polygon     from './polygon'
import Stellar     from './stellar'
import XinFin      from './xinfin'
import XRPL        from './xrpl'

type Dictionary = { [key:string]:any }

const Chains:Dictionary = {
  'Arbitrum':    Arbitrum,
  'Avalanche':   Avalanche,
  'Base':        Base,
//  'Binance':     Binance,
  'Celo':        Celo,
//  'EOS':         EOS,
//  'Ethereum':    Ethereum,
//  'Filecoin':    Filecoin,
  'Flare':       Flare,
  'Optimism':    Optimism,
  'Polygon':     Polygon,
  'Stellar':     Stellar,
  'XinFin':      XinFin,
  'XRPL':        XRPL
}

export default Chains