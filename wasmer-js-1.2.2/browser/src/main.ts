import { init, WASI } from '@wasmer/wasi'

async function main() {
  await init()

  const wasi = new WASI({
  })

  {
    const file = wasi.fs.open('/README.md', {read: true, write: true, create: true})
    file.writeString('The quick brown fox jumps over the lazy dog')
    file.seek(0)
  }

  const moduleBytes = fetch('filetest.wasm')
  const module = await WebAssembly.compileStreaming(moduleBytes)

  const importObject = Object.assign({}, wasi.getImports(module))
  const instance = await WebAssembly.instantiate(module, importObject as any)

  const exitCode = wasi.start(instance)
  console.log(`${wasi.getStdoutString()}\nexitCode=${exitCode}`)
}

main()
