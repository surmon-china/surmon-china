import path from 'path'
import fs from 'fs-extra'
import { OUTPUT_DIR } from './constants.js'

export const thousands = (number) => {
  var str = number.toString()
  var reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g
  return str.replace(reg, '$1,')
}

export const jsonStringify = (data) => {
  return JSON.stringify(data, null, 2)
}

export const writeFileToOutput = (fileName, fileData) => {
  return fs.writeFileSync(path.resolve(OUTPUT_DIR, fileName), fileData)
}

export const writeJSONToOutput = (fileName, jsonData) => {
  return writeFileToOutput(fileName, jsonStringify(jsonData))
}

export const consoleObject = (title, object) => {
  return console.log(title, JSON.stringify(object, null, 2))
}
