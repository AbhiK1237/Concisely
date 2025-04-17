import mongoose from 'mongoose';

interface INewsletter extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  summaries: mongoose.Types.ObjectId[];
  scheduledDate: Date;
  sentDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new mongoose.Schema(
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
    summaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Summary',
      },
    ],
    scheduledDate: {
      type: Date,
      required: true,
    },
    sentDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'failed'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);

export default Newsletter;