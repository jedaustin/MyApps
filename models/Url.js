import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description cannot be empty'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      validate: {
        validator: function (value) {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Please provide a valid URL'
      }
    },
    pinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
urlSchema.index({ userId: 1, pinned: -1, createdAt: -1 });

const Url = mongoose.model('Url', urlSchema);

export default Url;
