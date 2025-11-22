const express = require('express')
const router = express.Router()
const { processLocalImageWithKiro } = require('../lib/kiroClient')

// Example endpoint that processes the image you uploaded in chat
router.get('/demo-image', async (req,res)=>{
  try{
    // Local example image you provided in the conversation. The integration layer
    // that calls the real Kiro API will transform this to a proper upload URL if needed.
    const localPath = '/mnt/data/photo_9_2025-11-22_10-46-38.jpg'
    const result = await processLocalImageWithKiro(localPath, { mode: 'dashboard_analysis' })
    res.json(result)
  }catch(err){
    console.error(err)
    res.status(500).json({error: err.message})
  }
})

module.exports = router
