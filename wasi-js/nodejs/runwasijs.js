// Run:
// $ npx node runwasijs.js ../../res/filetest.wasm

'use strict'

const fs = require('fs')
const WASI = require('wasi-js').default
const nodeBindings = require('wasi-js/dist/bindings/node').default

;(async () => {
  if (process.argv.length < 3) {
    console.error('argv < 3')
    process.exit(1)
  }

  const wasmFileName = process.argv[2]
  const wasi = new WASI({
    args: process.argv.slice(2),
    env: process.env,
    bindings: {
      ...nodeBindings,
      fs,
    },
    preopens: {
      '.': '.',
    },
  })

  try {
    const wasmBin = fs.readFileSync(wasmFileName)
    const wasmModule = await WebAssembly.compile(wasmBin)
    const instance = await WebAssembly.instantiate(wasmModule, Object.assign({}, wasi.getImports(wasmModule)))

    wasi.start(instance)
  } catch (e) {
    console.error(e)
  }
})()
