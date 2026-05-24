// Run: node scripts/generate-icons.js
// Generates SVG-based PNG icons for PWA
const fs = require('fs')
const path = require('path')

const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#1A1A1A"/>
  <rect x="44" y="52" width="104" height="12" rx="6" fill="#FAFAF8" opacity="0.9"/>
  <rect x="44" y="76" width="80" height="8" rx="4" fill="#FAFAF8" opacity="0.6"/>
  <rect x="44" y="96" width="92" height="8" rx="4" fill="#FAFAF8" opacity="0.6"/>
  <rect x="44" y="116" width="68" height="8" rx="4" fill="#FAFAF8" opacity="0.4"/>
  <circle cx="148" cy="144" r="20" fill="#F59E0B"/>
  <rect x="140" y="143" width="16" height="2" rx="1" fill="#1A1A1A"/>
  <rect x="147" y="136" width="2" height="16" rx="1" fill="#1A1A1A"/>
</svg>`

const svg512 = svg192.replace(/width="192" height="192"/g, 'width="512" height="512"')
  .replace(/viewBox="0 0 192 192"/g, 'viewBox="0 0 192 192"')

fs.writeFileSync(path.join(__dirname, '../public/icons/icon.svg'), svg192)
console.log('SVG icon created')
