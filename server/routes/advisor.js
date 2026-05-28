const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const fetch = require('node-fetch').default;

// Simple rule-based fallback responses for common farming/gardening queries
function getFallbackResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Seasonal advice
    if (lowerPrompt.includes('season') || lowerPrompt.includes('time to plant') || 
        lowerPrompt.includes('when should i plant')) {
        if (lowerPrompt.includes('tomato')) {
            return "Tomatoes should be planted in spring after the last frost, when soil temperatures reach at least 60°F (15°C). Start seeds indoors 6-8 weeks before the last expected frost.";
        }
        if (lowerPrompt.includes('corn') || lowerPrompt.includes('maize')) {
            return "Plant corn in spring when soil temperatures are consistently above 50°F (10°C), typically 1-2 weeks after the last frost date.";
        }
        if (lowerPrompt.includes('winter')) {
            return "For winter gardening, focus on cold-hardy crops like kale, spinach, carrots, and Brussels sprouts. Use cold frames or row covers for protection.";
        }
        return "Consider your local climate and frost dates. Most vegetables are planted in spring after the danger of frost has passed. Consult your local extension office for specific planting times.";
    }
    
    // Crop-specific advice
    if (lowerPrompt.includes('tomato')) {
        return "Tomatoes need full sun (6-8 hours daily), well-draining soil rich in organic matter, and consistent watering. Support plants with cages or stakes, and prune indeterminate varieties for better air circulation.";
    }
    if (lowerPrompt.includes('corn')) {
        return "Corn grows best in blocks (not single rows) for proper pollination. It needs rich soil, plenty of nitrogen, and consistent moisture. Plant seeds 1-2 inches deep, 8-12 inches apart.";
    }
    if (lowerPrompt.includes('lettuce') || lowerPrompt.includes('salad')) {
        return "Lettuce prefers cooler temperatures and partial shade in hot climates. Keep soil consistently moist and harvest leaves regularly to encourage continued growth.";
    }
    
    // Soil advice
    if (lowerPrompt.includes('soil') || lowerPrompt.includes('compost') || lowerPrompt.includes('fertilizer')) {
        return "Healthy soil is the foundation of a good garden. Add compost to improve soil structure and fertility. Test your soil pH and amend as needed - most vegetables prefer pH 6.0-7.0.";
    }
    
    // Watering advice
    if (lowerPrompt.includes('water') || lowerPrompt.includes('irrigation')) {
        return "Water deeply and less frequently to encourage deep root growth. Early morning is the best time to water. Use mulch to retain moisture and reduce watering needs.";
    }
    
    // Pest/disease advice
    if (lowerPrompt.includes('pest') || lowerPrompt.includes('bug') || lowerPrompt.includes('disease')) {
        return "Prevention is key: maintain good garden hygiene, rotate crops, and encourage beneficial insects. For problems, try organic solutions like neem oil, insecticidal soap, or copper fungicides before resorting to chemicals.";
    }
    
    // General advice
    return "For successful gardening: start with good soil, provide adequate sunlight and water, choose plants suited to your climate, and monitor regularly for pests and diseases. When in doubt, consult your local agricultural extension office for region-specific advice.";
}

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
        
        // Helper function to process raw text into advice object and return JSON string
        function processAdvice(rawText) {
            let adviceObj;
            try {
                const cleaned = rawText.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                if (parsed.assessment && parsed.issue && parsed.action && parsed.urgency) {
                    adviceObj = parsed;
                } else {
                    throw new Error('Missing required fields');
                }
            } catch (e) {
                adviceObj = {
                    assessment: rawText.substring(0, 100) + (rawText.length > 100 ? '...' : ''),
                    issue: 'Unable to determine specific issue from advisor response',
                    action: 'Please consult with a human expert for advice',
                    urgency: 'Medium'
                };
            }
            return JSON.stringify(adviceObj);
        }

        // Try primary provider
        if (aiProvider === 'huggingface') {
            try {
                // Use Hugging Face Inference API
                if (!process.env.HF_TOKEN) {
                    console.error('HF_TOKEN is missing from environment variables')
                    throw new Error('HF_TOKEN missing')
                }

const model = process.env.HF_MODEL || 'google/flan-t5-xxl'
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
                                 max_new_tokens: 250,
                                 temperature: 0.2,
                                 top_p: 0.9,
                                 return_full_text: false
                             }
                         })
                     }
                 )

                // Handle non-2xx responses
                if (!response.ok) {
                    const errorText = await response.text()
                    console.error(`Hugging Face API error: ${response.status}`, errorText)
                    throw new Error(`HF API error: ${response.status}`)
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

                if(text && text.trim()) {
                    console.log('Successfully got response from Hugging Face')
                    const adviceJson = processAdvice(text)
                    res.json({ text: adviceJson })
                    return
                } else {
                    console.error('No text in Hugging Face response:', data)
                    throw new Error('Empty HF response')
                }
            } catch (hfError) {
                console.warn('Hugging Face API failed, falling back to Gemini:', hfError.message)
                // Fall through to try Gemini
            }
        }
        
        // Try Gemini (either as primary or fallback)
        try {
            // Check if GEMINI_KEY is configured
            if (!process.env.GEMINI_KEY) {
                console.error('GEMINI_KEY is missing from environment variables')
                throw new Error('GEMINI_KEY missing')
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
                throw new Error(`Gemini API error: ${response.status}`)
            }

            // Handle rate limiting specifically
            if(response.status === 429) {
                return res.status(429).json({ message: 'Advisor busy, try again shortly' })
            }

            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text

            if(text && text.trim()) {
                console.log('Successfully got response from Gemini')
                const adviceJson = processAdvice(text)
                res.json({ text: adviceJson })
                return
            } else {
                console.error('No text in Gemini response:', data)
                throw new Error('Empty Gemini response')
            }
        } catch (geminiError) {
            console.warn('Gemini API failed, using fallback response:', geminiError.message)
            // Fall through to use rule-based response
        }
        
        // If both APIs fail, use rule-based fallback
        console.log('Using rule-based fallback response')
        const fallbackText = getFallbackResponse(prompt)
        const adviceJson = processAdvice(fallbackText)
        res.json({ text: adviceJson })

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