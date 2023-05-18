import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

const global = /** @type {ServiceWorkerGlobalScope} */ (
  /** @type {unknown} */ (globalThis)
)

global.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') global.skipWaiting()
})

// self.__WB_MANIFEST is default injection point
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

/** @type {Map<string, Array<(value: any) => void>>} */
const nextMessageResolveMap = new Map()

/**
 *
 * @param {string} dataVal
 * @returns Promise<void>
 */
function nextMessage(dataVal) {
  return new Promise((resolve) => {
    if (!nextMessageResolveMap.has(dataVal)) {
      nextMessageResolveMap.set(dataVal, [])
    }
    nextMessageResolveMap.get(dataVal)?.push(resolve)
  })
}

global.addEventListener('message', (event) => {
  const resolvers = nextMessageResolveMap.get(event.data)
  if (resolvers === undefined) {
    return
  }
  nextMessageResolveMap.delete(event.data)
  for (const resolve of resolvers) {
    resolve(event.data)
  }
})

/**
 *
 * @param {{request: Request, url: URL, event: FetchEvent }} param0
 * @returns Promise<Response>
 */
async function handler({ event }) {
  const dataPromise = event.request.formData()

  event.waitUntil(
    (async function () {
      // The page sends this message to tell the service worker it's ready to receive the file.
      await nextMessage('share-ready')
      const client = await global.clients.get(event.resultingClientId)
      const data = await dataPromise
      const file = data.get('file')
      if (client !== undefined) {
        client.postMessage({ file, action: 'load-image' })
      }
    })()
  )
  return Response.redirect('/?share-target')
}

/**
 *
 * @param {{request: Request, url: URL }} param0
 */
function match({ url, request }) {
  if (
    url.pathname === '/' &&
    Boolean(url.searchParams.has('share-target')) &&
    request.method === 'POST'
  ) {
    return true
  }
  return false
}
// @ts-ignore
registerRoute(match, handler, 'POST')

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))
