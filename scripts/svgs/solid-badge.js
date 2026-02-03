import { renderSVG } from './_.js'

const defaultOptions = {
  width: 62,
  height: 28,
  radius: 4,
  title: '',
  icon: null,
  iconSize: 14,
  label: '-',
  color: '#fff',
  background: '#333'
}

export const renderSolidBadge = (options = {}) => {
  const opts = { ...defaultOptions, ...options }

  const html = `
    <div class="main">
      <span class="icon">${opts.icon ?? ''}</span>
      <span class="text">${opts.label}</span>
    </div>
  `

  const css = `
    .main {
      height: ${opts.height}px;
      display: flex;
      align-items: center;
      padding-inline: 10px;
      font-family: Verdana, Geneva, DejaVu Sans, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      border-radius: ${opts.radius}px;
      color: ${opts.color};
      background-color: ${opts.background};
      overflow: hidden;
      user-select: none;
    }

    .icon {
      flex-shrink: 0;
      display: inline-flex;
      width: ${opts.iconSize}px;
      height: ${opts.iconSize}px;
      margin-right: 8px;
    }
    .icon path {
      fill: ${opts.color};
    }
    .text {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
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
