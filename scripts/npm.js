const config = require('./config')
const { fetchNPMPackages, fetchNPMPackagesDownloads } = require('./service')

exports.getNPMDownloadsMap = async () => {
  const packageDownloadsMap = new Map()
  const packages = await fetchNPMPackages(config.NPM_UID)
  await Promise.all(
    packages.map(async (package) => {
      const packageName = package.package.name
      const downloadsResult = await fetchNPMPackagesDownloads(packageName)
      const downloads = downloadsResult?.downloads || 0
      packageDownloadsMap.set(packageName, downloads)
    })
  )

  return packageDownloadsMap
}
