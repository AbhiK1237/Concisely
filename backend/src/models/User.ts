import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  preferences: {
    topics: string[];
    deliveryFrequency: string;
    summaryLength: string;
    maxItemsPerNewsletter: number;
  };
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    preferences: {
      topics: {
        type: [String],
        default: [],
      },
      deliveryFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
      },
      summaryLength: {
        type: String,
        enum: ['short', 'medium', 'long'],
        default: 'medium',
      },
      maxItemsPerNewsletter: {
        type: Number,
        default: 5,
      },
    },
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;