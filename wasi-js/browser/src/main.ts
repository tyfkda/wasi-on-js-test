import WASI from 'wasi-js'
import nodeBindings from 'wasi-js/dist/bindings/browser'
import {fs} from '@cowasm/memfs'
import path from 'path-browserify'

async function main() {
  const originalWriteSync = fs.writeSync.bind(fs)
  fs.writeSync = (fd: number, buffer: Uint8Array|string|any, offset?: number, length?: any, position?: any) => {
    switch (fd) {
    case 1: case 2:
      {
        const text = typeof buffer === 'string' ? buffer : new TextDecoder().decode(buffer)
        if (fd === 1)
          document.body.appendChild(document.createTextNode(text))
        else
          console.error(text)
      }
      break
    }
    return originalWriteSync(fd, buffer, offset, length, position)
  }

  fs.writeFileSync('/README.md', 'The quick brown fox jumps over the lazy dog')

  const wasi = new WASI({
    bindings: {
      ...nodeBindings,
      fs,
      path,
    },
    preopens: {
      '/': '/',
    },
  })

  try {
    const moduleBytes = fetch('filetest.wasm')
    const wasmBin = await (await moduleBytes).arrayBuffer()
    const wasmModule = await WebAssembly.compile(wasmBin)
    const instance = await WebAssembly.instantiate(wasmModule, Object.assign({}, wasi.getImports(wasmModule)))

    wasi.start(instance)
  } catch (e) {
    console.error(e)
  }
}

main()
