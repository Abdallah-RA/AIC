// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/aic-website',
  assetPrefix: '/aic-website/',
  trailingSlash: true, // required for static export on GitHub Pages
}

module.exports = nextConfig
