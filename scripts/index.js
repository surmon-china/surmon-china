import { thousands, writeJSONToOutput } from './utils.js'
import { getNPMAggregate, getGitHubAggregate } from './aggregates.js'

try {
  const now = new Date()
  console.info('Generating:', now.toLocaleString(), '|', now.toString())
  console.log()

  // Aggregates
  const npmData = await getNPMAggregate()
  const githubData = await getGitHubAggregate()

  // GitHub JSON
  writeJSONToOutput('github.json', githubData)

  // NPM JSON
  writeJSONToOutput('npm.json', {
    packages: npmData.packages,
    downloads: Object.fromEntries(npmData.packageDownloadsMap)
  })

  // shields JSON
  writeJSONToOutput('shields.npm.downloads.json', {
    schemaVersion: 1,
    label: 'Total NPM Downloads',
    message: thousands(npmData.packageDownloadsTotal),
    cacheSeconds: 3600
  })

  writeJSONToOutput('shields.github.stars.json', {
    schemaVersion: 1,
    label: 'Total GitHub Stars',
    message: thousands(githubData.statistics.stars),
    cacheSeconds: 3600
  })

  console.log()
  console.info('All generation has been completed.')
  process.exit(0)
} catch (error) {
  console.error('Generate JSON error!', error)
  process.exit(1)
}
