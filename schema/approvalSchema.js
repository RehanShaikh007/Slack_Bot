const mongoose = require ('mongoose');

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

module.exports= mongoose.model('Approval', approvalSchema);

