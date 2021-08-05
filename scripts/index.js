const fs = require('fs')
const path = require('path')
const { getNPMDownloadsMap } = require('./npm')
const { JSONStringify, thousands } = require('./utils')
const OUTPUT_DIR = path.join(__dirname, '..', 'output')

;(async () => {
  // NPM
  const npmMap = await getNPMDownloadsMap()
  const packageCount = npmMap.size
  const npmDownloadsTotal = Array.from(npmMap.values()).reduce((total, current) => total + current, 0)
  console.log(`NPM data: package count > ${packageCount}, downloads total > ${npmDownloadsTotal}`)
  console.log(`NPM data map >`, npmMap)
  fs.writeFileSync(
    path.resolve(OUTPUT_DIR, 'npm.json'),
    JSONStringify({
      schemaVersion: 1,
      label: 'Total NPM DOWNLOADS',
      message: thousands(npmDownloadsTotal),
    })
  )

  // GitHub
  // total stars
  // total commits
  // total PRs
  const GITHUB_FILE_NAME = 'github.json'
})()
