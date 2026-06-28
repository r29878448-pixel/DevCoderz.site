export default async function handler(req, res) {
    const { batchId, subjectId, contentType, tag } = req.query;
    const targetUrl = `https://type-proxy.vercel.app/?batchId=${batchId}&subjectId=${subjectId}&contentType=${contentType}&tag=${tag}`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        res.status(200).json({
            success: true,
            data: data.data || [],
            credits: "Developed by DevCoderz"
        });
    } catch (e) {
        res.status(500).json({ 
            success: false, 
            error: "Failed",
            credits: "Developed by DevCoderz"
        });
    }
}
