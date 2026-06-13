export default async function handler(req, res) {
  // CORS pre-flight request handle karein
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { batch_id } = req.query;

  if (!batch_id) {
    return res.status(400).json({ error: "batch_id is required" });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const targetUrl = `https://eduvibe-pw-api.wasmer.app/batch.php?batch_id=${encodeURIComponent(batch_id)}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`External API returned status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ 
      error: "Failed to fetch data", 
      details: error.message 
    });
  }
}
