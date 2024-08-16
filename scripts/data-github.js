import { CONFIG, GITHUB_ACCESS_TOKEN } from './constants.js'
import { consoleObject } from './utils.js'
import {
  fetchGitHubUserinfo,
  fetchGitHubRepositories,
  fetchGitHubOrganizations,
  fetchGitHubGraphqlPrivateData
} from './apis.js'

export const getGitHubAggregate = async () => {
  const [userinfo, repositories, organizations, graphqlPrivateData] = await Promise.all([
    fetchGitHubUserinfo(CONFIG.GITHUB_UID),
    fetchGitHubRepositories(CONFIG.GITHUB_UID),
    fetchGitHubOrganizations(CONFIG.GITHUB_UID),
    fetchGitHubGraphqlPrivateData(CONFIG.GITHUB_UID, GITHUB_ACCESS_TOKEN)
  ])

  console.group(`[GitHub]`)
  consoleObject('counts:', {
    repositories: repositories.length,
    organizations: organizations.length
  })

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
  graphqlPrivateData.repositories.nodes.forEach((repo) => {
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

  // sponsors
  const pastSponsors = []
  const currentSponsors = graphqlPrivateData.sponsors.edges.map((edge) => edge.node) || []
  const currentSponsorsLogins = currentSponsors.map((item) => item.login)
  // 1. order by TIMESTAMP/DESC
  // 2. filter out current sponsors
  // 3. the latest user to cancel is at the head of the array
  // 4. no cancellation events for one-time sponsor
  graphqlPrivateData.sponsorsActivities.nodes.forEach((node) => {
    // Recently, GitHub returned the Ghost user as null
    if (node && node.sponsor.login !== 'ghost') {
      if (node.action === 'CANCELLED_SPONSORSHIP' || node.sponsorsTier.isOneTime) {
        if (!currentSponsorsLogins.includes(node.sponsor.login)) {
          pastSponsors.push(node.sponsor)
        }
      }
    }
  })

  consoleObject('sponsors:', {
    currentSponsors: currentSponsors.length,
    pastSponsors: pastSponsors.length
  })

  consoleObject('statistics:', {
    ...statistics,
    languages: statistics.languages.length,
    topics: Object.keys(statistics.topics).length
  })

  console.groupEnd()

  return {
    userinfo,
    statistics,
    repositories,
    organizations,
    currentSponsors,
    pastSponsors
  }
}
