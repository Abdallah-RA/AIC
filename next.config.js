/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repo = 'aic-website'

module.exports = {
  // export plain HTML/CSS/JS into `out/`
  output: 'export',

  // when in prod, mount all pages under `/aic-website`
  basePath: isProd ? `/${repo}` : '',

  // where to load JS/CSS chunks from
  assetPrefix: isProd ? `https://Abdallah-RA.github.io/${repo}` : '',
}
