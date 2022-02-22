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

exports.fetchNPMPackageDownloads = async (packageName) => {
  const now = new Date()
  const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  const response = await axios.get(`https://api.npmjs.org/downloads/point/2015-01-10:${today}/${packageName}`)
  return response.data
}

exports.fetchGitHubUserinfo = async (githubUID) => {
  const response = await axios.get(`https://api.github.com/users/${githubUID}`)
  return response.data
}

exports.fetchGitHubRepositories = async (githubUID) => {
  const response = await axios.get(`https://api.github.com/users/${githubUID}/repos?per_page=1000`)
  return response.data
}

exports.fetchGitHubOrganizations = async (githubUID) => {
  const response = await axios.get(`https://api.github.com/users/${githubUID}/orgs`)
  return response.data
}
