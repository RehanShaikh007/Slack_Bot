import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
    requesterId: String,
    approverId: String,
    text: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
});

const Approval = mongoose.model('Approval', approvalSchema);
