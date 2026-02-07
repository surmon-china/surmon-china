import { CONFIG, GITHUB_ACCESS_TOKEN } from './constants.js'
import { consoleObject } from './utils.js'
import { fetchGitHubGraphql } from './apis.js'

// https://docs.github.com/en/graphql/reference/objects#sponsorsactivity
// https://docs.github.com/en/graphql/reference/enums#sponsorsactivityaction
const SPONSOR_NODE_QUERY = `
  ... on User {
    login
    name
    url
    avatarUrl
    websiteUrl
  }
  ... on Organization {
    login
    name
    url
    avatarUrl
    websiteUrl
  }
`

const QUERY = `
  query {
    user(login: "${CONFIG.GITHUB_UID}") {
      repositories(
        first: 100
        isFork: false
        ownerAffiliations: OWNER
        orderBy: {field: CREATED_AT, direction: DESC}
      ) {
        nodes {
          name
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
      sponsorsActivities(first:100, period: ALL, orderBy: { direction: DESC, field: TIMESTAMP }, actions: [NEW_SPONSORSHIP, CANCELLED_SPONSORSHIP]) {
        nodes {
          action,
          sponsorsTier {
            isOneTime
          },
          sponsor {
            ${SPONSOR_NODE_QUERY}
          }
        }
      },
      sponsors(first: 100) {
        totalCount
        edges {
          node {
            ${SPONSOR_NODE_QUERY}
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              weekday
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`

export const getGitHubPrivateData = async () => {
  const graphqlPrivateData = await fetchGitHubGraphql(QUERY, GITHUB_ACCESS_TOKEN)
  console.group(`[GitHub Private]`)

  // ---------------------------------------------------------------
  // contributions (default: last year)
  const contributions = graphqlPrivateData.contributionsCollection.contributionCalendar
  console.log('last year totalContributions:', contributions.totalContributions)

  // ---------------------------------------------------------------
  // languages statistics
  const languages = []
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
    languages.push({ name: lang, ...item })
  }

  // sort languages by size
  languages.sort((a, b) => b.size - a.size)
  console.log('total languages:', languages.length)

  // ---------------------------------------------------------------
  // sponsors
  const currentSponsors = graphqlPrivateData.sponsors.edges.map((edge) => edge.node) || []
  const currentSponsorsLogins = currentSponsors.map((item) => item.login)

  const pastSponsors = []
  const addedPastLogins = new Set()
  // 1. order by TIMESTAMP/DESC
  // 2. filter out current sponsors
  // 3. the latest user to cancel is at the head of the array
  // 4. no cancellation events for one-time sponsor
  graphqlPrivateData.sponsorsActivities.nodes.forEach((node) => {
    // Recently, GitHub returned the Ghost user as null
    if (node && node.sponsor.login !== 'ghost') {
      if (node.action === 'CANCELLED_SPONSORSHIP' || node.sponsorsTier.isOneTime) {
        if (!currentSponsorsLogins.includes(node.sponsor.login)) {
          if (!addedPastLogins.has(node.sponsor.login)) {
            pastSponsors.push(node.sponsor)
            addedPastLogins.add(node.sponsor.login)
          }
        }
      }
    }
  })

  consoleObject('sponsors:', {
    totalCount: graphqlPrivateData.sponsors.totalCount,
    currentSponsors: currentSponsors.length,
    pastSponsors: pastSponsors.length
  })

  console.groupEnd()

  return {
    contributions,
    languages,
    sponsors: {
      totalCount: graphqlPrivateData.sponsors.totalCount,
      currentSponsors,
      pastSponsors
    }
  }
}
