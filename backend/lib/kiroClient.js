// Example wrapper that uploads a local file and calls Kiro AI
const fs = require('fs')
const fetch = (...args) => import('node-fetch').then(({default:fetch})=>fetch(...args))
const FormData = require('form-data')

const KIRO_API_KEY = process.env.KIRO_API_KEY
const KIRO_API_URL = process.env.KIRO_API_URL || 'https://api.kiro.ai/v1/process'

async function processLocalImageWithKiro(localPath, options={}){
  if(!KIRO_API_KEY) throw new Error('KIRO_API_KEY is not set in env')
  const fd = new FormData()
  fd.append('file', fs.createReadStream(localPath))
  fd.append('mode', options.mode || 'analysis')

  const res = await fetch(KIRO_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIRO_API_KEY}`
    },
    body: fd
  })

  if(!res.ok){
    const txt = await res.text()
    throw new Error('Kiro API error: ' + txt)
  }
  return res.json()
}

module.exports = { processLocalImageWithKiro }
