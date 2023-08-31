import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJSON = fs.readJSONSync(path.resolve(__dirname, '..', 'package.json'))

export const CONFIG = packageJSON.config
export const OUTPUT_DIR = path.join(__dirname, '..', 'output')

export const GITHUB_ACCESS_TOKEN = process.env.GITHUB_TOKEN
