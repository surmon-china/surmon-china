import { renderSVG } from './_.js'

const defaultOptions = {
  width: null,
  height: 30,
  radius: 2,
  title: '',
  icon: null,
  label: '',
  labelColor: '#fff',
  labelBackground: '#ddd',
  value: '-',
  valueColor: '#fff',
  valueBackground: '#aaa'
}

export const renderSegmentBadge = (options = {}) => {
  const opts = { ...defaultOptions, ...options }

  const html = `
    <div class="main">
      <div class="label">
        <span class="icon">${opts.icon ?? ''}</span>
        <span class="text">${opts.label}</span>
      </div>
      <div class="value">${opts.value}</div>
    </div>
  `

  const css = `
    .main {
      font-family: Verdana, Geneva, DejaVu Sans, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      display: inline-flex;
      height: ${opts.height}px;
      border-radius: ${opts.radius}px;
      overflow: hidden;
      user-select: none;
    }
    .label, .value {
      padding-inline: 10px;
      display: inline-flex;
      align-items: center;
    }
    .label {
      color: ${opts.labelColor};
      background-color: ${opts.labelBackground};
    }
    .label .icon {
      width: 1em;
      height: 1em;
      margin-right: 10px;
    }
    .label .icon path {
      fill: ${opts.labelColor};
    }
    .label .text {
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 2px;
    }
    .value {
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 1px;
      color: ${opts.valueColor};
      background-color: ${opts.valueBackground};
    }
  `

  return renderSVG({
    html,
    css,
    title: opts.title,
    attrs: {
      ...(opts.width ? { width: opts.width } : {}),
      ...(opts.height ? { height: opts.height } : {})
    }
  })
}
