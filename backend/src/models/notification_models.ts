import mongoose, { Schema, Document, Types } from 'mongoose';


export interface INotification extends Document {
  recipient: Types.ObjectId; 
  sender: Types.ObjectId;   
  note: Types.ObjectId;     
  message: string;        
  read: boolean;            
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;