import { WASI } from '@wasmer/wasi'
import { WasmFs } from '@wasmer/wasmfs'
import path from 'path-browserify'

async function main() {
  const wasmFs = new WasmFs()

  const originalWriteSync = wasmFs.fs.writeSync.bind(wasmFs.fs)
  wasmFs.fs.writeSync = (fd: number, buffer: Uint8Array|string|any, offset?: number, length?: any, position?: any) => {
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

  wasmFs.fs.writeFileSync('/README.md', 'The quick brown fox jumps over the lazy dog')

  const wasi = new WASI({
    bindings: {
      ...WASI.defaultBindings,
      fs: wasmFs.fs,
      path,
    },
    preopens: {
      '/': '/',
    },
  })

  const moduleBytes = fetch('filetest.wasm')
  const module = await WebAssembly.compileStreaming(moduleBytes)

  const imports = {
    wasi_snapshot_preview1: wasi.wasiImport,
  }
  const instance = await WebAssembly.instantiate(module, imports)

  wasi.setMemory(instance.exports.memory as WebAssembly.Memory)

  wasi.start(instance)
}

main()
