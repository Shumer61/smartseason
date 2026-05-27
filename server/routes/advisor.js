const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const fetch = require('node-fetch').default;

router.post('/', protect, async (req, res) => {
    console.log('Advisor route: Request received, user:', req.user ? req.user.id : 'no user')
    try {
        const { prompt } = req.body

        // Validate prompt
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ message: 'Valid prompt is required' })
        }

        // Check which AI provider to use
        const aiProvider = process.env.AI_PROVIDER || 'gemini'
        
        if (aiProvider === 'huggingface') {
            // Use Hugging Face Inference API
            if (!process.env.HF_TOKEN) {
                console.error('HF_TOKEN is missing from environment variables')
                return res.status(500).json({ message: 'Server configuration error: HF_TOKEN missing' })
            }

            const model = process.env.HF_MODEL || 'google/flan-t5-xl'
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.HF_TOKEN}`
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: 500,
                            temperature: 0.7,
                            return_full_text: false
                        }
                    })
                }
            )

            // Handle non-2xx responses
            if (!response.ok) {
                const errorText = await response.text()
                console.error(`Hugging Face API error: ${response.status}`, errorText)
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
            // Handle different response formats from HF
            let text = ''
            if (Array.isArray(data) && data.length > 0) {
                text = data[0].generated_text || data[0].summary_text || ''
            } else if (data.generated_text) {
                text = data.generated_text
            } else if (data.summary_text) {
                text = data.summary_text
            }

            if(!text) {
                console.error('No text in Hugging Face response:', data)
                return res.status(500).json({ message: 'No response from advisor' })
            }

            res.json({ text })
        } else {
            // Default to Gemini
            // Check if GEMINI_KEY is configured
            if (!process.env.GEMINI_KEY) {
                console.error('GEMINI_KEY is missing from environment variables')
                return res.status(500).json({ message: 'Server configuration error' })
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${process.env.GEMINI_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            )

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
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text

            if(!text) {
                console.error('No text in Gemini response:', data)
                return res.status(500).json({ message: 'No response from advisor' })
            }

            res.json({ text })
        }

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
