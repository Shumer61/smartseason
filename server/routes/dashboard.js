const express = require('express')
const router = express.Router()
const Field = require('../models/Field')
const { protect } = require('../middleware/auth')

router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? {}
            : { assignedTo: req.user._id }

        const fields = await Field.find(query)

        const summary = {
            total: fields.length,
            byStage: {
                Planted: fields.filter(f => f.stage === 'Planted').length,
                Growing: fields.filter(f => f.stage === 'Growing').length,
                Ready: fields.filter(f => f.stage === 'Ready').length,
                Harvested: fields.filter(f => f.stage === 'Harvested').length,
            },
            byStatus: {
                Active: fields.filter(f => f.status === 'Active').length,
                AtRisk: fields.filter(f => f.status === 'At Risk').length,
                Completed: fields.filter(f => f.status === 'Completed').length,
            }
        }

        res.json(summary)
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router