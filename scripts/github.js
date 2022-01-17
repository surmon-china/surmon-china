const config = require('./config')
const { fetchGitHubRepositorieLanguages } = require('./service')

exports.getGitHubStars = async () => {
  return 0
}

exports.getGitHubTopLanguages = async (excludeRepos = []) => {
  const token = process.env.GH_DEV_TOKEN
  console.log('token:', Boolean(token), token?.length)
  const repoNodes = await fetchGitHubRepositorieLanguages(config.GITHUB_UID, token)
  const nodes = repoNodes
    .filter((node) => {
      return (
        // exclude
        !excludeRepos.includes(node.name) &&
        // languages
        node.languages.edges.length > 0
      )
    })
    .sort((a, b) => b.size - a.size)

  const dataObject = nodes
    // flatten the list of language nodes
    .reduce((acc, curr) => curr.languages.edges.concat(acc), [])
    .reduce((acc, prev) => {
      // get the size of the language (bytes)
      let langSize = prev.size

      // if we already have the language in the accumulator
      // & the current language name is same as previous name
      // add the size to the language size.
      if (acc[prev.node.name] && prev.node.name === acc[prev.node.name].name) {
        langSize = prev.size + acc[prev.node.name].size
      }

      return {
        ...acc,
        [prev.node.name]: {
          name: prev.node.name,
          color: prev.node.color,
          size: langSize,
        },
      }
    }, {})

  const dataArray = Object.values(dataObject).sort((a, b) => b.size - a.size)
  const totalSize = dataArray.reduce((acc, item) => acc + item.size, 0)
  return dataArray.map((item) => ({
    ...item,
    percentage: Number(((item.size / totalSize) * 100).toFixed(2)),
  }))
}
