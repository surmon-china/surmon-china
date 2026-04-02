import { CONFIG } from './constants.js'
import { consoleObject } from './utils.js'
import { fetchNPMPackages, fetchNPMPackagesDownloads } from './apis.js'

// The earliest date for which npm download data is available
const NPM_DOWNLOADS_START = '2015-01-10'

// Used to avoid triggering Cloudflare rate limiting on api.npmjs.org
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// The npm downloads API limits each request to a maximum of 365 days per query.
// To retrieve all-time download counts since NPM_DOWNLOADS_START, we split the
// full date range into 365-day chunks and accumulate the results.
const buildChunks = () => {
  const chunks = []
  let cursor = new Date(NPM_DOWNLOADS_START)
  const end = new Date()
  while (cursor < end) {
    const chunkEnd = new Date(cursor)
    chunkEnd.setDate(chunkEnd.getDate() + 365)
    if (chunkEnd > end) chunkEnd.setTime(end.getTime())
    chunks.push({
      from: cursor.toISOString().slice(0, 10),
      to: chunkEnd.toISOString().slice(0, 10)
    })
    cursor.setDate(cursor.getDate() + 365)
  }
  return chunks
}

const fetchPackagesDownloads = async (packageNames) => {
  // Scoped packages (e.g. @scope/pkg) are not supported by the npm bulk downloads API
  // and must be queried individually.
  const scopedPkgNames = packageNames.filter((name) => name.startsWith('@'))
  const normalPkgNames = packageNames.filter((name) => !name.startsWith('@'))
  const downloadsMap = new Map(packageNames.map((name) => [name, 0]))
  const chunks = buildChunks()

  if (normalPkgNames.length) {
    // Bulk query: fetch all normal packages in a single request per chunk
    for (const { from, to } of chunks) {
      const data = await fetchNPMPackagesDownloads(normalPkgNames, from, to)
      Object.entries(data).forEach(([name, pkg]) => {
        downloadsMap.set(name, downloadsMap.get(name) + (pkg?.downloads || 0))
      })
      // Delay between chunk requests to avoid rate limiting
      await sleep(1000)
    }
    console.log('waiting...')
    // Extra cooldown between bulk and scoped queries to reset the rate limit window
    await sleep(5000)
  }

  if (scopedPkgNames.length) {
    // Individual query: each scoped package requires its own request per chunk
    for (const pkgName of scopedPkgNames) {
      for (const { from, to } of chunks) {
        const data = await fetchNPMPackagesDownloads(pkgName, from, to)
        downloadsMap.set(pkgName, downloadsMap.get(pkgName) + (data?.downloads || 0))
        // Delay between chunk requests to avoid rate limiting
        await sleep(1000)
      }
      console.log('waiting...')
      // Extra cooldown between each scoped package to avoid rate limiting
      await sleep(3000)
    }
  }

  return downloadsMap
}

export const getNpmPublicData = async () => {
  // packages
  const packages = await fetchNPMPackages(CONFIG.NPM_USERNAME)
  const packageDownloadsMap = await fetchPackagesDownloads(packages.map((item) => item.package.name))
  const packageDownloadsTotal = Array.from(packageDownloadsMap.values()).reduce((total, current) => total + current, 0)
  const packageCount = packages.length

  console.group('[NPM Public]')
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
