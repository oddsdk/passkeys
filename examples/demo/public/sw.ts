import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: globalThis.ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

const nextMessageResolveMap = new Map<string, Array<() => void>>()

// eslint-disable-next-line @typescript-eslint/promise-function-async
function nextMessage(dataVal: string): Promise<void> {
  return new Promise((resolve) => {
    if (!nextMessageResolveMap.has(dataVal)) {
      nextMessageResolveMap.set(dataVal, [])
    }
    nextMessageResolveMap.get(dataVal)?.push(resolve)
  })
}

self.addEventListener('message', (event) => {
  const resolvers = nextMessageResolveMap.get(event.data)
  if (resolvers === undefined) {
    return
  }
  nextMessageResolveMap.delete(event.data)
  for (const resolve of resolvers) resolve()
})

async function shareTargetHandler({
  event,
}: {
  event: FetchEvent
}): Promise<Response> {
  const dataPromise = event.request.formData()

  event.waitUntil(
    (async function () {
      // The page sends this message to tell the service worker it's ready to receive the file.
      await nextMessage('share-ready')
      const client = await self.clients.get(event.resultingClientId)
      const data = await dataPromise
      const file = data.get('file')
      if (client !== undefined) {
        client.postMessage({ file, action: 'load-image' })
      }
    })()
  )
  return Response.redirect('/?share-target')
}

const matchCb = ({ url, request, event }: any): boolean => {
  if (
    url.pathname === '/' &&
    Boolean(url.searchParams.has('share-target')) &&
    event.request.method === 'POST'
  ) {
    return true
  }
  return false
}
registerRoute(matchCb, shareTargetHandler, 'POST')

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))
