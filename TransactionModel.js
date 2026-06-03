import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    dataSaved: String,
    txHash: String,
    senderAddress: String,
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', TransactionSchema);