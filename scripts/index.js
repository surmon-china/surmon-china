const { CONFIG, thousands, writeJSONToOutput } = require('./utils')
const {
  fetchNPMPackages,
  fetchNPMPackageDownloads,
  fetchGitHubUserinfo,
  fetchGitHubRepositories,
  fetchGitHubOrganizations,
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
    cacheSeconds: 3600,
  })
}

// GitHub
const githubScript = async () => {
  const [userinfo, repositories, organizations] = await Promise.all([
    fetchGitHubUserinfo(CONFIG.GITHUB_UID),
    fetchGitHubRepositories(CONFIG.GITHUB_UID),
    fetchGitHubOrganizations(CONFIG.GITHUB_UID),
  ])
  console.log(`GitHub data: repositories > ${repositories.length}, organizations > ${organizations.length}`)

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
    userinfo,
    repositories,
    organizations,
    statistics,
  })
  writeJSONToOutput('github.stars.shields.json', {
    schemaVersion: 1,
    label: 'Total GitHub Stars',
    message: thousands(statistics.stars),
    cacheSeconds: 3600,
  })
}

;(async () => {
  try {
    const now = new Date()
    console.info('Generate run', now.toLocaleString(), '|', now.toString())
    await npmScript()
    await githubScript()
    console.info('Generate done')
    process.exit(0)
  } catch (error) {
    console.error('Generate error!', error)
    process.exit(1)
  }
})()
