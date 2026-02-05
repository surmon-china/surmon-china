import * as simpleIcons from 'simple-icons'
import { thousands, writeJSONToOutput, writeFileToOutput } from './utils.js'
import { getNpmPublicData } from './data-npm.js'
import { getGitHubPublicData } from './data-github.js'
import { getGitHubPrivateData } from './data-github-private.js'
import { renderSolidBadge } from './svgs/solid-badge.js'
import { renderSegmentBadge } from './svgs/segment-badge.js'
import { renderGitHubTopLanguages } from './svgs/github-top-languages.js'

try {
  const now = new Date()
  console.info('Generating:', now.toLocaleString(), '|', now.toString())
  console.log()

  // Data
  const npmPublicData = await getNpmPublicData()
  const githubPublicData = await getGitHubPublicData()
  const githubPrivateData = await getGitHubPrivateData()

  // NPM JSON
  writeJSONToOutput('npm.json', {
    packages: npmPublicData.packages,
    downloads: Object.fromEntries(npmPublicData.packageDownloadsMap)
  })

  // GitHub JSON
  writeJSONToOutput('github.json', { ...githubPublicData })
  writeJSONToOutput('github.languages.json', githubPrivateData.languages)
  writeJSONToOutput('github.sponsors.json', githubPrivateData.sponsors)
  writeJSONToOutput('github.contributions.json', githubPrivateData.contributions)

  // GitHub Top Languages - light
  writeFileToOutput(
    'github-top-languages-light.svg',
    await renderGitHubTopLanguages({
      title: `GitHub Top Languages`,
      languages: githubPrivateData.languages,
      color: '#27292a',
      borderRadius: 6,
      borderColor: '#d0d7de',
      backgroundColor: '#fff',
      legendGradientBackgroundColor: '#eee'
    })
  )

  // GitHub Top Languages - dark
  writeFileToOutput(
    'github-top-languages-dark.svg',
    await renderGitHubTopLanguages({
      title: `GitHub Top Languages`,
      languages: githubPrivateData.languages,
      color: '#e6edf3',
      borderRadius: 6,
      borderColor: '#30363d',
      backgroundColor: 'transparent',
      legendGradientBackgroundColor: '#222'
    })
  )

  // Total GitHub Stars
  writeFileToOutput(
    'total-github-stars.svg',
    await renderSegmentBadge({
      width: 260,
      height: 30,
      radius: 6,
      title: `Total GitHub Stars: ${githubPublicData.statistics.stars}`,
      icon: simpleIcons.siGithub.svg,
      label: 'Total GitHub Stars',
      value: thousands(githubPublicData.statistics.stars),
      labelBackground: '#2d333b',
      valueBackground: '#22272e'
    })
  )

  // Total NPM Downloads
  writeFileToOutput(
    'total-npm-downloads.svg',
    await renderSegmentBadge({
      width: 308,
      height: 30,
      radius: 6,
      title: `Total NPM Downloads: ${npmPublicData.packageDownloadsTotal}`,
      icon: simpleIcons.siNpm.svg,
      label: 'Total NPM Downloads',
      value: thousands(npmPublicData.packageDownloadsTotal),
      labelBackground: '#bb161b',
      valueBackground: '#231f20'
    })
  )

  // Badges
  writeFileToOutput(
    'badge-blog.svg',
    await renderSolidBadge({
      width: 82,
      title: `Surmon.me`,
      background: '#0088f5',
      label: 'BLOG',
      iconSize: 16,
      icon: `
        <svg viewBox="0 0 174 87" xmlns="http://www.w3.org/2000/svg">
          <path id="path1" fill="#0088f5" stroke="none" d="M 48.599998 80.5 L 44.299999 84.799995 C 43.799999 85.299995 43.200001 85.599998 42.5 85.599998 C 41.799999 85.599998 41.099998 85.299995 40.5 84.799995 L 0.9 45.099998 C 0.3 44.5 0 43.799999 0 43.099998 C 0 42.399998 0.3 41.699997 0.9 41.099998 L 40.5 1.5 C 41 0.900002 41.700001 0.599998 42.5 0.599998 C 43.299999 0.599998 43.900002 0.900002 44.299999 1.5 L 48.599998 5.800003 C 49.200001 6.300003 49.5 7 49.5 7.800003 C 49.5 8.599998 49.200001 9.199997 48.599998 9.599998 L 15.2 43.099998 L 48.599998 76.5 C 49.200001 77.099998 49.5 77.799995 49.5 78.5 C 49.5 79.199997 49.200001 79.900002 48.599998 80.5 Z"/>
          <path id="path2" fill="#0088f5" stroke="none" d="M 113.699997 2.800003 L 78 85.5 C 77.800003 86 77.300003 86.5 76.5 86.799995 C 75.699997 87.099998 75 87.099998 74.300003 86.900002 L 68.5 85.900002 C 67.599998 85.699997 67 85.299995 66.599998 84.900002 C 66.300003 84.400002 66.099998 83.900002 66.300003 83.299995 L 102 0.800003 C 102.300003 0.199997 102.900002 -0.199997 103.5 -0.5 C 104.199997 -0.699997 104.900002 -0.800003 105.699997 -0.699997 L 111.699997 0.400002 C 112.5 0.599998 113.099998 0.900002 113.599998 1.400002 C 114 1.800003 114.099998 2.300003 113.699997 2.800003 Z"/>
          <path id="path3" fill="#0088f5" stroke="none" d="M 173.399994 45.099998 L 133.800003 84.699997 C 133.199997 85.199997 132.5 85.5 131.800003 85.5 C 131.100006 85.5 130.399994 85.199997 129.800003 84.699997 L 125.5 80.400002 C 125 79.799995 124.699997 79.099998 124.699997 78.400002 C 124.699997 77.699997 125 77 125.5 76.400002 L 158.899994 43.099998 L 125.5 9.599998 C 125 9.099998 124.699997 8.5 124.699997 7.800003 C 124.699997 7.099998 125 6.400002 125.5 5.800003 L 129.800003 1.5 C 130.399994 0.900002 131.100006 0.599998 131.800003 0.599998 C 132.5 0.599998 133.199997 0.900002 133.800003 1.5 L 173.399994 41.099998 C 173.899994 41.599998 174.199997 42.299999 174.199997 43.099998 C 174.199997 43.899998 173.899994 44.599998 173.399994 45.099998 Z"/>
        </svg>
      `
    })
  )

  writeFileToOutput(
    'badge-linkedin.svg',
    await renderSolidBadge({
      width: 60,
      title: `LinkedIn`,
      background: '#0a66c2',
      icon: simpleIcons.siLinkedin.svg,
      label: 'LI'
    })
  )

  writeFileToOutput(
    'badge-leetcode.svg',
    await renderSolidBadge({
      width: 60,
      title: `LeetCode`,
      background: '#FFA116',
      icon: simpleIcons.siLeetcode.svg,
      label: 'LC'
    })
  )

  writeFileToOutput(
    'badge-instagram.svg',
    await renderSolidBadge({
      width: 60,
      title: `Instagram`,
      background: '#E4405F',
      icon: simpleIcons.siInstagram.svg,
      label: 'IG'
    })
  )

  writeFileToOutput(
    'badge-threads.svg',
    await renderSolidBadge({
      title: `Threads`,
      background: '#000000',
      icon: simpleIcons.siThreads.svg,
      iconSize: 13,
      label: 'TH'
    })
  )

  writeFileToOutput(
    'badge-twitter.svg',
    await renderSolidBadge({
      title: `Twitter`,
      background: '#000000',
      icon: simpleIcons.siX.svg,
      iconSize: 13,
      label: 'TW'
    })
  )

  writeFileToOutput(
    'badge-youtube.svg',
    await renderSolidBadge({
      title: `YouTube`,
      background: '#FF0000',
      icon: simpleIcons.siYoutube.svg,
      label: 'YT'
    })
  )

  writeFileToOutput(
    'badge-telegram.svg',
    await renderSolidBadge({
      title: `Telegram`,
      background: '#26A5E4',
      icon: simpleIcons.siTelegram.svg,
      label: 'TG'
    })
  )

  writeFileToOutput(
    'badge-discord.svg',
    await renderSolidBadge({
      title: `Discord`,
      background: '#5865F2',
      icon: simpleIcons.siDiscord.svg,
      label: 'DC'
    })
  )

  console.log()
  console.info('All generation has been completed.', (Date.now() - now.getTime()) / 1000 + 's')
  process.exit(0)
} catch (error) {
  console.error('Generate JSON error!', error)
  process.exit(1)
}
