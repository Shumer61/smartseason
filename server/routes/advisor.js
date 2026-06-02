const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')

router.post('/', protect, async (req, res) => {
    try {
        const { prompt } = req.body

        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an agricultural field advisor. Always respond with valid JSON only, no extra text.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 500
                })
            }
        )

        if(!response.ok) {
            const err = await response.json()
            console.warn('Groq error:', err)
            return res.status(500).json({ message: 'Advisor unavailable' })
        }

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content

        if(!text) return res.status(500).json({ message: 'No response from advisor' })

        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        res.json({ text: JSON.stringify(parsed) })

    } catch(error) {
        console.warn('advisor route error:', error.message)
        res.status(500).json({ message: 'Advisor unavailable' })
    }
})

module.exports = router