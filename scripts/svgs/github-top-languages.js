import fs from 'fs'
import path from 'path'
import { renderSVG } from './_.js'

const devIconFileMap = new Map([['Less', 'less-plain-wordmark']])
const devIconNameMap = new Map([
  ['Vue', 'vuejs'],
  ['HTML', 'html5'],
  ['CSS', 'css3'],
  ['SASS', 'sass'],
  ['SCSS', 'sass'],
  ['Shell', 'bash'],
  ['Objective-C', 'xcode']
])

const getLanguageIconSvg = (name) => {
  try {
    const iconName = devIconNameMap.get(name) ?? name.toLocaleLowerCase()
    const fileName = devIconFileMap.get(name) ?? iconName + '-original'
    const svgPath = path.resolve(`node_modules/devicon/icons/${iconName}/${fileName}.svg`)
    return fs.readFileSync(svgPath, { encoding: 'utf-8' })
  } catch {
    return '<span class="placeholder"></span>'
  }
}

const defaultOptions = {
  width: 846,
  height: 188,
  languages: [],
  title: '',
  color: '#333',
  borderRadius: 6,
  borderColor: '#aaa',
  backgroundColor: 'transparent',
  legendGradientBackgroundColor: 'transparent',
  countLimit: 12,
  columns: 4,
  rowGap: 25,
  columnGap: 32
}

export const renderGitHubTopLanguages = (options = {}) => {
  const opts = { ...defaultOptions, ...options }
  const languages = opts.languages.slice(0, opts.countLimit)

  const renderProgressItem = (language) => `
    <span
      class="item"
      data-lang="${language.name}"
      style="background-color: ${language.color}; width: ${language.percentage}%"
    ></span>
  `

  const renderLegendItem = (language, index) => `
    <div class="legend" style="--color: ${language.color};">
      <span class="color" style="--gradient: ${80 - index * 5}%">
        <span class="core" style="width: ${language.percentage}%"></span>
      </span>
      <span class="icon">${getLanguageIconSvg(language.name)}</span>
      <span class="name">${language.name}</span>
      <span class="percentage">${language.percentage}%</span>
    </div>
  `

  const html = `
    <div class="main">
      <div class="progress">
        ${languages.map(renderProgressItem).join('')}
      </div>
      <div
        class="languages"
        style="
          grid-template-columns: repeat(${opts.columns}, 1fr);
          grid-row-gap: ${opts.rowGap}px;
          grid-column-gap: ${opts.columnGap}px;
        "
      >
        ${languages.map(renderLegendItem).join('')}
      </div>
    </div>
  `

  const css = `
    .main {
      --gap: 24px;
      --progress-size: 13px;
      padding: var(--gap);
      padding-bottom: 28px;
      border: 1px solid;
      border-radius: ${opts.borderRadius}px;
      color: ${opts.color};
      border-color: ${opts.borderColor};
      background-color: ${opts.backgroundColor};
      font-size: 13px;
      font-family:
        ui-monospace,
        SFMono-Regular,
        SF Mono,
        Menlo,
        Consolas,
        Liberation Mono,
        monospace;
    }

    .progress {
      width: 100%;
      height: var(--progress-size);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 20px;
      display: flex;
    }

    .progress .item {
      height: 100%;
    }

    .languages {
      display: grid;
    }

    .languages .legend {
      display: flex;
      align-items: center;
      position: relative;
    }

    .legend .color {
      position: absolute;
      bottom: -9px;
      left: 0;
      width: 100%;
      height: 3px;
      display: inline-flex;
      background-image: linear-gradient(to right, ${opts.legendGradientBackgroundColor}, transparent var(--gradient), transparent);
    }
    .legend .color .core {
      display: inline-block;
      background-color: var(--color);
    }
    .legend .icon {
      width: 14px;
      height: 14px;
      margin-right: 0.5em;
      border-radius: 2px;
    }
    .legend .icon .placeholder {
      display: inline-block;
      width: 100%;
      height: 100%;
      background-color: var(--color);
    }
    .legend .name {
      margin-right: 0.3em;
      white-space: nowrap;
    }
    .legend .percentage {
      font-size: 90%;
      color: #767f89;
    }
  `

  return renderSVG({
    html,
    css,
    title: opts.title,
    attrs: {
      width: opts.width,
      height: opts.height
    }
  })
}
