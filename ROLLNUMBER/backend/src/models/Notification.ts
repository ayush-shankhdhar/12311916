import { Schema, model, Document } from 'mongoose';

export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface INotification extends Document {
  studentId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  priorityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: ['Event', 'Result', 'Placement'],
    },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

/* 
  Compound Index 1: For fast fetching of user notifications filtered by read status and sorted by creation date.
  Order: studentId_1_isRead_1_createdAt_-1
*/
NotificationSchema.index({ studentId: 1, isRead: 1, createdAt: -1 });

/*
  Compound Index 2: For fetching notifications by type, sorted by creation date.
  Order: type_1_createdAt_-1
*/
NotificationSchema.index({ type: 1, createdAt: -1 });

/* Text index for any full-text message searches in future */
NotificationSchema.index({ message: 'text' });

export const Notification = model<INotification>('Notification', NotificationSchema);
