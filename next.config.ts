// next.config.js
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repo   = 'AIC'  // ← your GitHub repo name, case-sensitive

module.exports = {
  // output a fully static site into `out/`
  output: 'export',

  // when running in prod, mount all pages under `/AIC`
  basePath: isProd ? `/${repo}` : '',

  // tell the client where to fetch JS/CSS chunks from
  assetPrefix: isProd
    ? `https://abdallah-ra.github.io/${repo}/`
    : '',
}
