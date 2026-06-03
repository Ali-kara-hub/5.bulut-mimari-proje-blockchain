import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { ethers } from 'ethers';
import Transaction from './TransactionModel.js'; // ESM'de dosya uzantısı (.js) zorunludur

const app = express();
app.use(express.json());
app.use(express.static('.'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🍃 MongoDB bağlantısı başarılı."))
    .catch(err => console.error("MongoDB hatası:", err));

const contractABI = [
    "function setData(string memory _newData) public",
    "function getData() public view returns (string memory)"
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

app.post('/api/save-data', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Metin alanı boş olamaz." });

        console.log(`⛓️ Blockchain'e gönderiliyor: "${text}"`);
        
        const tx = await contract.setData(text);
        
        console.log("⏳ İşlemin blok zincirine eklenmesi bekleniyor...");
        const receipt = await tx.wait(); 

        const newLog = new Transaction({
            dataSaved: text,
            txHash: receipt.hash,
            senderAddress: wallet.address
        });
        await newLog.save();

        res.status(200).json({
            message: "Veri başarıyla Blockchain ve MongoDB'ye kaydedildi!",
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (error) {
        console.error("Hata oluştu:", error);
        res.status(500).json({ error: "İşlem gerçekleştirilemedi.", details: error.message });
    }
});
app.get('/api/transactions', async (req, res) => {
    try {
        const history = await Transaction.find().sort({ timestamp: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: "Veriler getirilemedi.", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Node.js Backend ${PORT} portunda çalışıyor.`);
});