const { CONFIG, thousands, writeJSONToOutput } = require('./utils')
const {
  fetchNPMPackages,
  fetchNPMPackageDownloads,
  fetchGitHubRepositories,
  fetchGitHubOriginations,
} = require('./fetchers')

// NPM
const npmScript = async () => {
  // packages
  const packages = await fetchNPMPackages(CONFIG.NPM_UID)
  // packages downloads map
  const packageDownloadsMap = new Map()
  await Promise.all(
    packages.map(async (package) => {
      const packageName = package.package.name
      const downloadsResult = await fetchNPMPackageDownloads(packageName)
      const downloads = downloadsResult?.downloads || 0
      packageDownloadsMap.set(packageName, downloads)
    })
  )

  const packageCount = packageDownloadsMap.size
  const npmDownloadsTotal = Array.from(packageDownloadsMap.values()).reduce((total, current) => total + current, 0)
  console.log(`NPM data: package count > ${packageCount}, downloads total > ${npmDownloadsTotal}`)
  console.log(`NPM data map >`, packageDownloadsMap)

  writeJSONToOutput('npm.json', {
    packages,
    downloads: Object.fromEntries(packageDownloadsMap),
  })
  writeJSONToOutput('npm.downloads.shields.json', {
    schemaVersion: 1,
    label: 'Total NPM Downloads',
    message: thousands(npmDownloadsTotal),
  })
}

// GitHub
const githubScript = async () => {
  const repositories = await fetchGitHubRepositories(CONFIG.GITHUB_UID)
  const originations = await fetchGitHubOriginations(CONFIG.GITHUB_UID)
  console.log(`GitHub data: repositories > ${repositories.length}, originations > ${originations.length}`)

  // statistics
  const statistics = {
    size: 0,
    stars: 0,
    forks: 0,
    open_issues: 0,
    languages: [],
    topics: [],
  }
  repositories.forEach((repository) => {
    statistics.stars += repository.stargazers_count
    statistics.forks += repository.forks_count
    statistics.open_issues += repository.open_issues
    // owner only
    if (!repository.fork && repository.owner.login === CONFIG.GITHUB_UID) {
      statistics.size += repository.size
      statistics.topics.push(...repository.topics)
      if (repository.language) {
        statistics.languages.push(repository.language)
      }
    }
  })

  statistics.topics = Array.from(new Set([...statistics.topics]))
  statistics.languages = Array.from(new Set([...statistics.languages]))
  console.log(`GitHub statistics:`, statistics)

  writeJSONToOutput('github.json', {
    repositories,
    originations,
    statistics,
  })
  writeJSONToOutput('github.stars.shields.json', {
    schemaVersion: 1,
    label: 'Total GitHub Stars',
    message: thousands(statistics.stars),
  })
}

;(async () => {
  await npmScript()
  await githubScript()
})()
