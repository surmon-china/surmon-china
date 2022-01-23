const fs = require('fs')
const path = require('path')

exports.CONFIG = require('../package.json').config
exports.OUTPUT_DIR = path.join(__dirname, '..', 'output')

exports.thousands = (num) => {
  var str = num.toString()
  var reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g
  return str.replace(reg, '$1,')
}

exports.jsonStringify = (data) => {
  return JSON.stringify(data, null, 2)
}
exports.writeFileToOutput = (fileName, fileData) => {
  return fs.writeFileSync(path.resolve(exports.OUTPUT_DIR, fileName), fileData)
}
exports.writeJSONToOutput = (fileName, jsonData) => {
  return exports.writeFileToOutput(fileName, exports.jsonStringify(jsonData))
}
