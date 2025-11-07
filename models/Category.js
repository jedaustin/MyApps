import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [1, 'Category name must be at least 1 character'],
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

categorySchema.pre('validate', function (next) {
  if (this.name) {
    this.normalizedName = this.name.trim().toLowerCase();
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;

