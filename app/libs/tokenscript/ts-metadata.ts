import axios from 'axios'
import { getERC5169ScriptURISingle, getErc7738scriptURI } from '../ethereum'
import { TokenScript } from './engine-lite/tokenscript'
import { Meta } from './engine-lite/tokenScript/Meta'
import { getTsCache, setTsCache } from './ts-cache'

export type MetdataOptions = {
  actions?: boolean
}

export type TsMetadata = {
  actions?: string[]
  meta: Meta
  name: string
}

const defaultOptions = {
  actions: true,
}

export async function getTokenscriptMetadata(
  chainId: number,
  contract: `0x${string}`,
  options: MetdataOptions = defaultOptions,
  index = 0,
  entry?: number,
): Promise<TsMetadata> {
  const scriptURIs = await getERC5169ScriptURISingle(chainId, contract)
  let scriptURI = scriptURIs[index]
  if (scriptURIs === 'not implemented' || !scriptURI) {
    scriptURI = await getErc7738scriptURI(chainId, contract, entry)
    console.log('erc7738 scriptURI', scriptURI)
    if (scriptURI === 'not implemented' || !scriptURI) {
      console.log('Script URI not exist')
      throw new Error('Some errors for import, please check the server log')
    }
  }

  const tokenscript = await loadTokenscript(scriptURI)

  const result: any = {}

  if (options.actions) {
    result.actions = tokenscript.getCards().map((card) => card.name)
  }

  result.meta = tokenscript.getMetadata()
  result.name = tokenscript.getName()

  return result
}

async function loadTokenscript(scriptURI: string) {
  let tokenscript = getTsCache(scriptURI)
  if (!tokenscript) {
    const httpUrl = rewriteUrlIfIpfsUrl(scriptURI)
    const xmlStr = (await axios.get(httpUrl)).data

    let parser
    if (typeof process !== 'undefined' && process.release.name === 'node') {
      const { JSDOM } = await import('jsdom')
      const jsdom = new JSDOM()
      parser = new jsdom.window.DOMParser()
    } else {
      parser = new DOMParser()
    }
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml')
    tokenscript = new TokenScript(xmlStr, xmlDoc)
    setTsCache(scriptURI, tokenscript)
  }

  return tokenscript
}

function rewriteUrlIfIpfsUrl(url: string) {
  if (!url) {
    return ''
  } else if (url.toLowerCase().startsWith('https://ipfs.io/ipfs')) {
    return url.replace(
      'https://ipfs.io/ipfs',
      'https://gateway.pinata.cloud/ipfs',
    )
  } else if (url.toLowerCase().startsWith('ipfs://ipfs')) {
    return url.replace('ipfs://ipfs', 'https://gateway.pinata.cloud/ipfs')
  } else if (url.toLowerCase().startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
  }
  return url
}
