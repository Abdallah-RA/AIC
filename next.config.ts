// next.config.js
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repo   = 'aic-website'          // ← your GitHub repo name (folder in your homepage URL)

module.exports = {
  // 1) static-export mode
  output: 'export',

  // 2) run all pages *inside* https://<username>.github.io/<repo>/
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd
    ? `https://Abdallah-RA.github.io/${repo}`
    : '',

  // 3) disable trailing slash on all routes (GitHub Pages doesn’t handle .html fallback)
  trailingSlash: false,

  // you can add other Next.js settings here…
}
