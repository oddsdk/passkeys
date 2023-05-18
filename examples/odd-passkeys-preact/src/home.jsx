/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable unicorn/no-null */
import * as odd from '@oddjs/odd'
import { isFile } from '@oddjs/odd/fs/types/check'
import { useEffect, useState } from 'preact/hooks'
import { useOdd } from '@oddjs/preact/router'
import { ReactComponent as DeleteIcon } from './assets/delete.svg'
import { ReactComponent as OpenIcon } from './assets/open.svg'

const branch = odd.path.RootBranch.Public

/**
 * @param {import('preact').Attributes} props
 */
export default function Home(props) {
  const { session, isLoading, logout } = useOdd({
    redirectTo: '/login',
  })
  const [status, setStatus] = useState('')
  const [files, setFiles] = useState(
    /** @type {Array<{src: string, path: string, cid?: string, file: string[], blob: Blob } | null>} */ ([])
  )

  useEffect(() => {
    getFiles(session)
  }, [session])

  /**
   *
   * @param {import('@oddjs/odd').Session | null} session
   */
  async function getFiles(session) {
    if (session && session.fs) {
      const { fs } = session
      const path = odd.path.directory(branch, 'test')
      if (await fs.exists(path)) {
        const links = await fs.ls(path)
        const files = await Promise.all(
          Object.entries(links).map(async ([name]) => {
            // @ts-ignore
            const isPrivate = branch === 'private'
            const filepath = odd.path.combine(path, odd.path.file(name))
            const file = await fs.get(filepath)

            if (!isFile(file)) return null

            let mime
            const p = filepath.file.join('/')
            if (p.endsWith('.jpg') || p.endsWith('.jpeg')) {
              mime = 'image/jpeg'
            }
            if (p.endsWith('.png')) {
              mime = 'image/png'
            }

            // Create a blob to use as the image `src`
            const blob = new Blob([file.content], { type: mime })
            const src = URL.createObjectURL(blob)

            const cid = isPrivate
              ? /** @type { import('@oddjs/odd/fs/v1/PrivateFile').PrivateFile} */ (
                  file
                ).header.content
              : /** @type { import('@oddjs/odd/fs/v1/PublicFile').PublicFile} */ (
                  file
                ).cid?.toString()

            return {
              path: filepath.file.join('/'),
              src,
              cid,
              file: filepath.file,
              blob,
            }
          })
        )

        setFiles(files)
      }
    }
  }

  async function onUpload() {
    setStatus('Uploading...')
    const fileEl = document.querySelector('input[type="file"]')
    if (fileEl && session && session.fs) {
      const { fs } = session
      // @ts-ignore
      const file = /** @type {File} */ (fileEl.files[0])

      await fs.write(
        odd.path.file(branch, 'test', file.name),
        new Uint8Array(await new Blob([file]).arrayBuffer())
      )

      setStatus('Publishing changes...')
      // Announce the changes to the server
      await fs.publish()

      await getFiles(session)
      setStatus('')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <div>
      <h2>Upload</h2>
      <input type="file" id="input" onChangeCapture={onUpload} />
      <h2>Files </h2>
      {status && <h5>{status}</h5>}

      <div class="Grid">
        {files
          ? Object.values(files).map((file) => {
              if (!file) return null
              return (
                <div key={file.path} class="Box">
                  <p class="Box-text">{file.path}</p>
                  <img src={file.src} width="100" />
                  <br />
                  <button
                    type="button"
                    onClick={async () => {
                      if (session && session.fs) {
                        setStatus('Deleting...')
                        // @ts-ignore
                        await session.fs?.rm(odd.path.file(...file.file))
                        await session.fs.publish()
                        await getFiles(session)
                        setStatus('')
                      }
                    }}
                  >
                    <DeleteIcon style="fill: currentColor; width: 16px" />
                  </button>
                  <a
                    class="button"
                    target="_blank"
                    href={`https://${file.cid}.ipfs.dweb.link/userland`}
                    rel="noreferrer"
                    title={file.cid}
                  >
                    <OpenIcon style="fill: currentColor; width: 16px" />
                  </a>
                </div>
              )
            })
          : 'N/A'}
      </div>
      <h2>Account</h2>
      <div>{session?.username}</div>
      <button
        type="button"
        onClick={async () => {
          await logout()
        }}
      >
        Logout
      </button>
    </div>
  )
}
