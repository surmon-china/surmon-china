import axios from 'axios'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Fetch failed:', error.toJSON())
    return Promise.reject(error)
  }
)

// https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md
export const fetchNPMPackages = async (npmUsername) => {
  const url = `https://registry.npmjs.com/-/v1/search?text=maintainer:${npmUsername}&size=250`
  console.log(`fetch: ${url}`)
  const response = await axios.get(url)
  return response.data.objects
}

// https://github.com/npm/registry/blob/main/docs/download-counts.md
export const fetchNPMPackagesDownloads = async (packageNames, from, to) => {
  const names = Array.isArray(packageNames) ? packageNames.join(',') : packageNames
  const url = `https://api.npmjs.org/downloads/point/${from}:${to}/${names}`
  console.log(`fetch: ${url}`)
  const response = await axios.get(url)
  return response.data
}

export const fetchGitHubUserinfo = async (githubUsername) => {
  const url = `https://api.github.com/users/${githubUsername}`
  console.log(`fetch: ${url}`)
  const response = await axios.get(url)
  return response.data
}

export const fetchGitHubUserOrganizations = async (githubUsername) => {
  const url = `https://api.github.com/users/${githubUsername}/orgs`
  console.log(`fetch: ${url}`)
  const response = await axios.get(url)
  return response.data
}

export const fetchGitHubUserRepositories = async (githubUsername) => {
  const url = `https://api.github.com/users/${githubUsername}/repos?per_page=100`
  console.log(`fetch: ${url}`)
  const response = await axios.get(url)
  return response.data
}

export const fetchGitHubOrgRepositories = async (githubOrgName) => {
  const url = `https://api.github.com/orgs/${githubOrgName}/repos?per_page=100`
  console.log(`fetch: ${url}`)
  const response = await axios.get(url)
  return response.data
}

// https://docs.github.com/en/graphql/overview/explorer
// https://docs.github.com/en/graphql/reference/objects#user
export const fetchGitHubGraphql = async (query, githubToken) => {
  const response = await axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    data: { query },
    headers: {
      Authorization: `Bearer ${githubToken}`
    }
  })

  if (response.data.errors) {
    console.error(response.data.errors)
    throw new Error(response.data.errors.map((error) => error.message).join('; '))
  }

  return response.data.data.user
}
