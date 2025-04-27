// Summary Model
import mongoose from 'mongoose';

interface IRatings {
  helpful: number;
  not_helpful: number;
}

interface ISummary extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  originalContent: string;
  summary: string;
  sourceUrl: string;
  sourceType: string;
  topics: string[];
  ratings: IRatings; // Added missing field
  createdAt: Date;
  updatedAt: Date;
}

const summarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    originalContent: {
      type: String,
      required: false,
    },
    summary: {
      type: String,
      required: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['article', 'youtube', 'podcast', 'document'],
      required: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    ratings: {
      helpful: {
        type: Number,
        default: 0
      },
      not_helpful: {
        type: Number,
        default: 0
      }
    }
  },
  { timestamps: true }
);

const Summary = mongoose.model<ISummary>('Summary', summarySchema);

export default Summary;