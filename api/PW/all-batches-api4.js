const crypto = require('crypto');

const KEY = crypto.createHash('sha256').update("hellobhai").digest();

export default async function handler(req, res) {
    const { batchId, subjectId, contentType, tag } = req.query;
    const targetUrl = `https://type-proxy.vercel.app/?batchId=${batchId}&subjectId=${subjectId}&contentType=${contentType}&tag=${tag}`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        res.status(200).json({
            iv: iv.toString('hex'),
            encryptedData: encrypted
        });
    } catch (e) {
        res.status(500).json({ error: "Failed", details: e.message });
    }
}
