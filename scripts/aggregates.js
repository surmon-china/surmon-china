import { CONFIG, GITHUB_ACCESS_TOKEN } from './constants.js'
import {
  fetchNPMPackages,
  fetchNPMPackageDownloads,
  fetchGitHubUserinfo,
  fetchGitHubRepositories,
  fetchGitHubOrganizations,
  fetchGitHubRepositoryLanguages
} from './fetchers.js'

// NPM
export const getNPMAggregate = async () => {
  // packages
  const packages = await fetchNPMPackages(CONFIG.NPM_UID)
  // packages downloads map
  const packageDownloadsMap = new Map()
  await Promise.all(
    packages.map(async (item) => {
      const packageName = item.package.name
      const downloadsResult = await fetchNPMPackageDownloads(packageName)
      const downloads = downloadsResult?.downloads || 0
      packageDownloadsMap.set(packageName, downloads)
    })
  )

  const packageCount = packageDownloadsMap.size
  const packageDownloadsTotal = Array.from(packageDownloadsMap.values()).reduce((total, current) => total + current, 0)
  const counts = {
    packages: packageCount,
    downloads: packageDownloadsTotal
  }
  console.group(`[NPM]`)
  console.log('counts:', JSON.stringify(counts, null, 2))
  console.log(`map:`, packageDownloadsMap)
  console.groupEnd()

  return {
    packages,
    packageCount,
    packageDownloadsMap,
    packageDownloadsTotal
  }
}

// GitHub
export const getGitHubAggregate = async () => {
  const [userinfo, repositories, organizations, repoLanguages] = await Promise.all([
    fetchGitHubUserinfo(CONFIG.GITHUB_UID),
    fetchGitHubRepositories(CONFIG.GITHUB_UID),
    fetchGitHubOrganizations(CONFIG.GITHUB_UID),
    fetchGitHubRepositoryLanguages(CONFIG.GITHUB_UID, GITHUB_ACCESS_TOKEN)
  ])
  const counts = {
    repositories: repositories.length,
    organizations: organizations.length
  }
  console.group(`[GitHub]`)
  console.log('counts:', JSON.stringify(counts, null, 2))

  // statistics
  const statistics = {
    size: 0,
    stars: 0,
    forks: 0,
    open_issues: 0,
    languages: [],
    topics: {}
  }

  // basic statistics
  repositories.forEach((repository) => {
    statistics.stars += repository.stargazers_count
    statistics.forks += repository.forks_count
    statistics.open_issues += repository.open_issues
    // owner only
    if (!repository.fork && repository.owner.login === CONFIG.GITHUB_UID) {
      statistics.size += repository.size
      repository.topics.forEach((topic) => {
        statistics.topics[topic] = statistics.topics[topic] || 0
        statistics.topics[topic] += 1
      })
    }
  })

  // languages statistics
  let totalSize = 0
  const languageStats = {}
  repoLanguages.forEach((repo) => {
    repo.languages.edges.forEach((edge) => {
      const langSize = edge.size
      const langName = edge.node.name
      const langColor = edge.node.color
      totalSize += langSize
      if (languageStats[langName]) {
        languageStats[langName].size += langSize
      } else {
        languageStats[langName] = {
          size: langSize,
          color: langColor
        }
      }
    })
  })

  for (const lang in languageStats) {
    const item = languageStats[lang]
    item.percentage = Number((item.size / totalSize) * 100).toFixed(2)
    statistics.languages.push({ name: lang, ...item })
  }

  // sort languages by size
  statistics.languages.sort((a, b) => b.size - a.size)

  console.log(`statistics:`, statistics)
  console.groupEnd()

  return {
    userinfo,
    repositories,
    organizations,
    statistics
  }
}
