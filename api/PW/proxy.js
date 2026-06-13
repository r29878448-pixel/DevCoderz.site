export default async function handler(req, res) {
  const { url } = req.query; // Client se aane wala URL

  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    // Mtaarius ki API ko target karein
    const target = "https://mtaiirus-api.onrender.com" + url;
    
    const response = await fetch(target, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://mtaiirus-api.onrender.com/',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : null
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy Error" });
  }
}
