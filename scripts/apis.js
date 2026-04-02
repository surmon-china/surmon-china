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
  const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=maintainer:${npmUsername}&size=250`)
  return response.data.objects
}

// https://github.com/npm/registry/blob/master/docs/download-counts.md
export const fetchNPMPackageDownloads = async (packageName) => {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const response = await axios.get(`https://api.npmjs.org/downloads/point/2015-01-10:${today}/${packageName}`)
  return response.data
}

export const fetchGitHubUserinfo = async (githubUsername) => {
  const response = await axios.get(`https://api.github.com/users/${githubUsername}`)
  return response.data
}

export const fetchGitHubUserOrganizations = async (githubUsername) => {
  const response = await axios.get(`https://api.github.com/users/${githubUsername}/orgs`)
  return response.data
}

export const fetchGitHubUserRepositories = async (githubUsername) => {
  const response = await axios.get(`https://api.github.com/users/${githubUsername}/repos?per_page=100`)
  return response.data
}

export const fetchGitHubOrgRepositories = async (githubOrgName) => {
  const response = await axios.get(`https://api.github.com/orgs/${githubOrgName}/repos?per_page=100`)
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
