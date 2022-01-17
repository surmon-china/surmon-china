const fs = require('fs')
const path = require('path')
const { getNPMDownloadsMap } = require('./npm')
const { getGitHubTopLanguages } = require('./github')
const { renderTopLanguagesCard } = require('./top-languages-svg')
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
  // top languages
  const topLanguages = await getGitHubTopLanguages()
  console.log(`GitHub top languages:`, topLanguages)
  fs.writeFileSync(
    path.resolve(OUTPUT_DIR, 'github.json'),
    JSONStringify({
      topLanguages,
    })
  )
  // top languages svg card
  const darkSvg = renderTopLanguagesCard(topLanguages)
  const lightSvg = renderTopLanguagesCard(topLanguages, {
    cardBorderColor: '#d0d7de',
    cardBackground: '#fff',
    langNameColor: '#27292a',
  })
  fs.writeFileSync(path.resolve(OUTPUT_DIR, 'github-top-languages-dark.svg'), darkSvg)
  fs.writeFileSync(path.resolve(OUTPUT_DIR, 'github-top-languages-light.svg'), lightSvg)
})()
