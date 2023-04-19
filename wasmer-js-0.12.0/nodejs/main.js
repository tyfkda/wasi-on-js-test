// $ npx node main.js ../../res/filetest.wasm
// $ wasmer --dir=. ../../res/filetest.wasm
// $ wasmtime --dir=. ../../res/filetest.wasm

const { WASI } = require('@wasmer/wasi')

const fs = require('fs')
const path = require('path')

async function main() {
  const wasi = new WASI({
    bindings: {
      ...WASI.defaultBindings,
      fs,
      path,
    },
    preopens: {
      '.': '.',
    },
  })

  const filename = process.argv[2]
  const buffer = fs.readFileSync(filename)
  const wasmModule = await WebAssembly.compile(buffer)
  const importObject = Object.assign({}, wasi.getImports(wasmModule))
  const instance = await WebAssembly.instantiate(wasmModule, importObject)

  wasi.start(instance)
}

main()
