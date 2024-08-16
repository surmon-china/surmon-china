import prettier from 'prettier'

export const renderSVG = async ({ html, css, title, attrs } = {}) => {
  const attrsArr = attrs ? Object.keys(attrs).map((key) => `${key}="${attrs[key]}"`) : []
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      role="img"
      fill="none" ${attrsArr.join(' ')}
    >
      <title>${title ?? ''}</title>
      <foreignObject width="100%" height="100%">
        <div id="root" xmlns="http://www.w3.org/1999/xhtml">
          <style>${css ?? ''}</style>
          ${html ?? ''}
        </div>
      </foreignObject>
    </svg>
  `

  return await prettier.format(svg, { parser: 'html' })
}
