const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const fetch = require('node-fetch').default;

router.post('/', protect, async (req, res) => {
    try {
        const { prompt } = req.body

        // Validate prompt
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ message: 'Valid prompt is required' })
        }

        // Check if GEMINI_KEY is configured
        if (!process.env.GEMINI_KEY) {
            console.error('GEMINI_KEY is missing from environment variables')
            return res.status(500).json({ message: 'Server configuration error' })
        }

        console.log('Advisor route: Making request to Gemini API')
        console.log('Advisor route: fetch type:', typeof fetch)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        )

        console.log(`Advisor route: Gemini API responded with status: ${response.status}`)
        
        // Handle non-2xx responses
        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Gemini API error: ${response.status}`, errorText)
            return res.status(response.status).json({ 
                message: 'Advisor API error', 
                details: errorText 
            })
        }

        // Handle rate limiting specifically
        if(response.status === 429) {
            return res.status(429).json({ message: 'Advisor busy, try again shortly' })
        }

        const data = await response.json()
        console.log('Advisor route: Gemini response data:', JSON.stringify(data).substring(0, 200) + '...')
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if(!text) {
            console.error('No text in Gemini response:', data)
            return res.status(500).json({ message: 'No response from advisor' })
        }

        console.log('Advisor route: Sending response to client')
        res.json({ text })

    } catch(error) {
        console.error('Advisor route error:', error)
        res.status(500).json({ 
            message: 'Advisor unavailable',
            // Only include error details in development
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        })
    }
})

module.exports = router