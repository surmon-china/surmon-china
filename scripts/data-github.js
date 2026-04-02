import { CONFIG } from './constants.js'
import { consoleObject } from './utils.js'
import {
  fetchGitHubUserinfo,
  fetchGitHubUserRepositories,
  fetchGitHubUserOrganizations,
  fetchGitHubOrgRepositories
} from './apis.js'

export const getGitHubPublicData = async () => {
  const [userinfo, repositories, organizations] = await Promise.all([
    fetchGitHubUserinfo(CONFIG.GITHUB_USERNAME),
    fetchGitHubUserRepositories(CONFIG.GITHUB_USERNAME),
    fetchGitHubUserOrganizations(CONFIG.GITHUB_USERNAME)
  ])

  // statistics
  const statistics = {
    size: 0,
    stars: 0,
    forks: 0,
    open_issues: 0,
    topics: {}
  }

  // user repositories
  repositories.forEach((repository) => {
    statistics.stars += repository.stargazers_count
    statistics.forks += repository.forks_count
    statistics.open_issues += repository.open_issues
    // owner only
    if (!repository.fork && repository.owner.login === CONFIG.GITHUB_USERNAME) {
      statistics.size += repository.size
      repository.topics.forEach((topic) => {
        statistics.topics[topic] = statistics.topics[topic] || 0
        statistics.topics[topic] += 1
      })
    }
  })

  // organization repositories
  const organizationsRepositoriesList = await Promise.all(
    organizations.map(({ login }) => fetchGitHubOrgRepositories(login))
  )

  organizationsRepositoriesList.flat().forEach((repository) => {
    if (CONFIG.GITHUB_ORGANIZATION_REPOSITORIES.includes(repository.name)) {
      statistics.stars += repository.stargazers_count
    }
  })

  console.group('[GitHub Public]')
  consoleObject('counts:', {
    repositories: repositories.length,
    organizations: organizations.length
  })

  consoleObject('statistics:', statistics)
  console.groupEnd()

  return {
    userinfo,
    statistics,
    repositories,
    organizations
  }
}
