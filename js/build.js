/**
 * Build script for Vercel deployment.
 * Generates js/config.js from the APIFY_API_KEY environment variable.
 *
 * Usage: node build.js
 *
 * The APIFY_API_KEY environment variable must be set in Vercel project settings.
 */
const fs = require('fs');
const path = require('path');

const apiKey = process.env.APIFY_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: APIFY_API_KEY environment variable is not set.');
  console.error('   Set it in your Vercel project dashboard:');
  console.error('   Settings → Environment Variables → APIFY_API_KEY');
  process.exit(1);
}

const templatePath = path.join(__dirname, 'js', 'config.template.js');
const outputPath = path.join(__dirname, 'js', 'config.js');

let content = fs.readFileSync(templatePath, 'utf-8');

// Replace the placeholder with the actual API key
content = content.replace(
  `const APIFY_API_KEY = typeof APIFY_API_KEY_ENV !== 'undefined'
  ? APIFY_API_KEY_ENV
  : 'YOUR_API_TOKEN_HERE';`,
  `const APIFY_API_KEY = '${apiKey}';`
);

fs.writeFileSync(outputPath, content, 'utf-8');
console.log('✅ js/config.js generated successfully from APIFY_API_KEY environment variable.');
