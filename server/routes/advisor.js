const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')

router.post('/', protect, async (req, res) => {
    try {
        const { prompt } = req.body

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        )

        if(response.status === 429) {
            return res.status(429).json({ message: 'Advisor busy, try again shortly' })
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if(!text) return res.status(500).json({ message: 'No response from advisor' })

        res.json({ text })

    } catch(error) {
        console.warn('advisor route failed')
        res.status(500).json({ message: 'Advisor unavailable' })
    }
})

module.exports = router