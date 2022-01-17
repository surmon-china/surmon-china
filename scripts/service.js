const axios = require('axios')

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Fetch failed:', error)
    return Promise.reject(error)
  }
)

exports.fetchNPMPackages = async (npmUID) => {
  const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=maintainer:${npmUID}`)
  return response.data.objects
}

exports.fetchNPMPackagesDownloads = async (packageName) => {
  const now = new Date()
  const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  const response = await axios.get(`https://api.npmjs.org/downloads/point/2015-01-10:${today}/${packageName}`)
  return response.data
}

exports.fetchGitHubUserInfo = async (githubUID) => {
  const response = await axios.get(`https://api.github.com/users/${githubUID}`)
  return response.data
}

exports.fetchGitHubRepositories = async (githubUID) => {
  const response = await axios.get(`https://api.github.com/users/${githubUID}/repos?per_page=1000`)
  return response.data
}

exports.fetchGitHubOriginations = async (githubUID) => {
  const response = await axios.get(`https://api.github.com/users/${githubUID}/orgs`)
  return response.data
}

// Fork from: https://github.com/anuraghazra/github-readme-stats/blob/master/src/fetchers/top-languages-fetcher.js
exports.fetchGitHubRepositorieLanguages = async (githubUID, token) => {
  const query = `
    query userInfo($login: String!) {
      user(login: $login) {
        # fetch only owner repos & not forks
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          nodes {
            name
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  color
                  name
                }
              }
            }
          }
        }
      }
    }
  `

  const response = await axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers: { Authorization: `token ${token}` },
    data: {
      query,
      variables: { login: githubUID },
    },
  })

  if (response.data.errors) {
    console.error(response.data.errors)
    throw Error(response.data.errors[0].message || 'Could not fetch user')
  }

  return response.data.data.user.repositories.nodes
}
