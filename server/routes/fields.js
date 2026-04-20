const express = require('express')
const router = express.Router()
const Field = require('../models/Field')
const { protect } = require('../middleware/auth')
const { adminOnly } = require('../middleware/roles')

// Admin — get all fields
// Agent — get only assigned fields
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? {}
            : { assignedTo: req.user._id }
        const fields = await Field.find(query).populate('assignedTo', 'name email')
        res.json(fields)
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})

// Admin only — create field
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, cropType, plantingDate, assignedTo } = req.body
        const field = await Field.create({ name, cropType, plantingDate, assignedTo })
        res.status(201).json(field)
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})

// Admin only — assign field to agent
router.put('/:id/assign', protect, adminOnly, async (req, res) => {
    try {
        const field = await Field.findByIdAndUpdate(
            req.params.id,
            { assignedTo: req.body.agentId },
            { new: true }
        )
        res.json(field)
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})

// Agent — update stage and add note
router.put('/:id/update', protect, async (req, res) => {
    try {
        const field = await Field.findById(req.params.id)

        if(!field) return res.status(404).json({ message: 'Field not found' })

        // Agent can only update their assigned fields
        if(req.user.role === 'agent' &&
            field.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not your field' })
        }

        if(req.body.stage) field.stage = req.body.stage
        if(req.body.note) {
            field.notes.push({ text: req.body.note, addedBy: req.user._id })
        }

        await field.save()
        res.json(field)
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})
// Admin only — delete field
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const field = await Field.findByIdAndDelete(req.params.id)
        if(!field) return res.status(404).json({ message: 'Field not found' })
        res.json({ message: 'Field deleted' })
    } catch(error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router