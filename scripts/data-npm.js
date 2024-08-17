import { CONFIG } from './constants.js'
import { consoleObject } from './utils.js'
import { fetchNPMPackages, fetchNPMPackageDownloads } from './apis.js'

export const getNpmPublicData = async () => {
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

  console.group(`[NPM Public]`)
  consoleObject('counts:', {
    packages: packageCount,
    downloads: packageDownloadsTotal
  })
  console.log(`map:`, packageDownloadsMap)
  console.groupEnd()

  return {
    packages,
    packageCount,
    packageDownloadsMap,
    packageDownloadsTotal
  }
}
