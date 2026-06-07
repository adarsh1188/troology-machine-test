const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g. PROJECT_CREATED
    entity: { type: String }, // e.g. Project / User
    entityId: { type: mongoose.Schema.Types.ObjectId },
    message: { type: String, required: true }, // human readable
    meta: { type: Object },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
