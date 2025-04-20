import mongoose from 'mongoose';

interface INewsletter extends mongoose.Document {
  title: string;
  content: string;
  topics: string[];
  summaries: mongoose.Types.ObjectId[];
  sentTo: mongoose.Types.ObjectId[];
  sentAt: Date;
  scheduledDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    topics: [
      {
        type: String,
      }
    ],
    summaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Summary',
      },
    ],
    sentTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    sentAt: {
      type: Date,
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'failed'],
      default: 'draft',
    }
  },
  { timestamps: true }
);

const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);

export default Newsletter;