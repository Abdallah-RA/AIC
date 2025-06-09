// next.config.js

const isProd = process.env.NODE_ENV === 'production'

const basePath = isProd ? process.env.BASE_PATH || '/AIC' : ''

module.exports = {
  output: 'export',
  basePath,
  assetPrefix: basePath + '/',
  trailingSlash: true,
}
