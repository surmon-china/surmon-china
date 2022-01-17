const simpleIcons = require('simple-icons')

// https://devicon.dev/
// https://github.com/simple-icons/simple-icons#cdn-usage
const getSimpleIconCDN = (slug) => {
  return `https://cdn.jsdelivr.net/npm/simple-icons@v6/icons/${slug}.svg`
}

// https://github.com/simple-icons/simple-icons/blob/develop/slugs.md
const disabledSconSlugs = ['Starlark']
const iconSlugMap = new Map([
  ['TypeScript', 'typescript'],
  ['JavaScript', 'javascript'],
  ['Vue', 'vuedotjs'],
  ['Dart', 'dart'],
  ['PHP', 'php'],
  ['HTML', 'html5'],
  ['CSS', 'css3'],
  ['SASS', 'sass'],
  ['SCSS', 'sass'],
  ['Less', 'less'],
  ['Ruby', 'ruby'],
  ['Java', 'java'],
  ['Swift', 'swift'],
  ['Python', 'python'],
  ['Markdown', 'markdown'],
  ['Shell', 'powershell'],
  ['Objective-C', 'apple'],
  ['C', 'c'],
])

const fontFamily = `'Segoe UI', Ubuntu, Sans-Serif`

const css = `
  .header {
    font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #2f80ed;
  }
  image {
    filter: invert(1);
  }
  .logo-icon {
    transform: scale(0.7) translate(0px, 2px);
  }
  * {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
`

const style = {
  width: 850,
  height: 190,
  cardPadding: 25,
  cardRadius: 0,
  cardOpacity: 0.9,
  cardBorderColor: '#444c56',
  cardBackground: '#22272e',
  langNameColor: '#e3e3e3',
  langPercentageColor: '#767f89',
  progressHeight: 14,
  progressRadius: 2,
  legendSize: 20,
  legendLineMargin: 40,
  legendLineCount: 5,
}

const renderProgress = (languages) => {
  const items = []
  const width = style.width - style.cardPadding * 2
  let leftWidth = 0

  const renderItem = (language, width, left) => `
    <rect
      mask="url(#rect-mask)"
      data-testid="lang-progress"
      y="0"
      x="${left}"
      width="${width}"
      height="${style.progressHeight}"
      fill="${language.color}"
    />
  `

  languages.forEach((language) => {
    const itemWidth = (width * language.percentage) / 100
    items.push(renderItem(language, itemWidth, leftWidth))
    leftWidth += itemWidth
  })

  return items.join('\n')
}

const renderLegend = (languages, line) => {
  const width = style.width - style.cardPadding * 2
  const itemWidth = width / style.legendLineCount

  const renderItem = (language, index) => {
    const renderFirstWord = () => {
      const htmlStyle = [
        `width: 100%`,
        `text-align: center`,
        `font-size: 18px`,
        `font-weight: bold`,
        `color: ${language.color}`,
        `font-family:${fontFamily}`,
        `line-height: ${style.legendSize}px`,
      ]
      return `
        <foreignObject width="${style.legendSize}" height="${style.legendSize}">
          <body xmlns="http://www.w3.org/1999/xhtml" style="margin: 0;">
            <div style="${htmlStyle.join(';')}">${language.name[0].toUpperCase()}</div>
          </body>
        </foreignObject>
      `
    }

    return `
      <g transform="translate(${index * itemWidth}, 0)">
        <g>
          ${
            language.icon
              ? `<path class="logo-icon" d="${language.icon.path}" fill="${language.color}" />`
              : renderFirstWord()
          }
          <foreignObject x="${style.legendSize + 5}" width="130" height="${style.legendSize}">
            <body xmlns="http://www.w3.org/1999/xhtml" style="margin: 0;">
              <div style="${[
                'width: 100%',
                'font-size: 14px',
                `color: ${style.langNameColor}`,
                `font-family: ${fontFamily}`,
                `line-height: 1.5`,
              ].join(';')}">
                ${language.name}
                <span
                  style="${['margin-left: 2px', 'font-size: 13px', `color: ${style.langPercentageColor}`].join(';')}"
                >
                ${language.percentage}%
                </span>
              </div>
            </body>
          </foreignObject>
        </g>
      </g>
    `
  }

  return `
    <g transform="translate(0, ${line * style.legendLineMargin})">
      ${languages.map(renderItem).join('\n')}
    </g>
  `
}

exports.renderTopLanguagesCard = (languages) => {
  // overwrite colors by simply icon
  languages = languages.map((language) => {
    const lowerCaseName = language.name.toLocaleLowerCase()
    if (!disabledSconSlugs.includes(language.name)) {
      const maybeSlug = iconSlugMap.get(language.name) || iconSlugMap.get(lowerCaseName)
      const icon = simpleIcons.Get(maybeSlug || lowerCaseName)
      if (icon) {
        language.icon = icon
        language.gh_color = language.color
        language.color = `#${icon.hex}`
      }
    }
    return language
  })

  return `<?xml version="1.0" encoding="utf-8"?>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${style.width}"
      height="${style.height}"
      viewBox="0 0 ${style.width} ${style.height}"
      fill="none"
    >
    <style>${css}</style>
    <rect
      data-testid="card-bg"
      x="0"
      y="0"
      rx="${style.cardRadius}"
      height="100%"
      width="${style.width}"
      fill="${style.cardBackground}"
      stroke="${style.cardBorderColor}"
      opacity="${style.cardOpacity}"
    />
    <g data-testid="main-card-body" transform="translate(0, ${style.cardPadding})">
      <svg data-testid="lang-items" x="${style.cardPadding}">
        <mask id="rect-mask">
          <rect
            x="0"
            y="0"
            width="${style.width}"
            height="${style.progressHeight}"
            rx="${style.progressRadius}"
            fill="white"
          />
        </mask>
        ${renderProgress(languages)}
        <g transform="translate(0, ${style.cardPadding * 1.618})">
          ${renderLegend(languages.slice(0, 5), 0)}
          ${renderLegend(languages.slice(5, 10), 1)}
          ${renderLegend(languages.slice(10, 15), 2)}
        </g>
      </svg>
    </g>
  </svg>
  `
}
