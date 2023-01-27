const fs = require('fs')

const readNdJsonToObject = (file) => {
  return fs.readFileSync(file).toString().split('\n').filter(i => i.length > 1).map(i => JSON.parse(i))
}

const run = () => {
  fs.writeFileSync('results.json', JSON.stringify(readNdJsonToObject('cached_results.ndjson')))
}

run()