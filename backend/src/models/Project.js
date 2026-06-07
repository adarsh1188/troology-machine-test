const mongoose = require('mongoose');

const STATUSES = ['Pending', 'In-Progress', 'Completed'];

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true }, // local path or cloudinary url
    mimetype: String,
    size: Number,
    storage: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
    publicId: String, // cloudinary public id (for deletion)
  },
  { _id: true, timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Pending',
    },
    assignedUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    attachments: {
      type: [attachmentSchema],
      validate: {
        validator(v) {
          return v.length <= 3;
        },
        message: 'A project can have at most 3 attachments',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Useful indexes for search / filtering
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ status: 1 });
projectSchema.index({ endDate: 1 });

projectSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Project', projectSchema);
