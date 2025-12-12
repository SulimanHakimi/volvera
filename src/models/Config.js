import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Config || mongoose.model('Config', ConfigSchema);
