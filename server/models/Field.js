const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
})

const FieldSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cropType: { type: String, required: true },
    plantingDate: { type: Date, required: true },
    stage: {
        type: String,
        enum: ['Planted', 'Growing', 'Ready', 'Harvested'],
        default: 'Planted'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: [NoteSchema]
}, { timestamps: true })

// Computed status — not stored, calculated on the fly
FieldSchema.virtual('status').get(function() {
    if(this.stage === 'Harvested') return 'Completed'
    const daysSincePlanting = Math.floor(
        (Date.now() - this.plantingDate) / (1000 * 60 * 60 * 24)
    )
    if(daysSincePlanting > 90 && this.stage !== 'Ready') return 'At Risk'
    return 'Active'
})

FieldSchema.set('toJSON', { virtuals: true })
FieldSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Field', FieldSchema)