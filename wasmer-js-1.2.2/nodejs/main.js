// $ npx node main.js ../../res/filetest.wasm
// $ wasmer --dir=. ../../res/filetest.wasm
// $ wasmtime --dir=. ../../res/filetest.wasm

const { init, WASI } = require('@wasmer/wasi')

const fs = require('fs')

async function main() {
  await init()

  const wasi = new WASI({
    env: process.env,
    args: process.args,
  })

  // @wasmer/wasi 1.2.2 ではローカルファイルを扱えない
  // メモリ上に構築した仮想ファイルのみ
  {
    const file = wasi.fs.open('/README.md', {read: true, write: true, create: true})
    file.writeString('The quick brown fox jumps over the lazy dog')
    file.seek(0)
  }

  const filename = process.argv[2]
  const buffer = fs.readFileSync(filename)
  const wasmModule = await WebAssembly.compile(buffer)
  const importObject = Object.assign({}, wasi.getImports(wasmModule))
  const instance = await WebAssembly.instantiate(wasmModule, importObject)

  const exitCode = wasi.start(instance)
  console.log(`${wasi.getStdoutString()}\nexitCode=${exitCode}`)
}

main()
