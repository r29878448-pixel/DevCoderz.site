export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { kid, batch_id, mpdUrl } = req.query;

  let targetUrl = "";

  if (kid) {
    targetUrl = `https://mtaiirus-api.onrender.com/api/pw/otp?kid=${encodeURIComponent(kid)}`;
  } else if (batch_id) {
    targetUrl = `https://eduvibe-pw-api.wasmer.app/batch.php?batch_id=${encodeURIComponent(batch_id)}`;
  } else if (mpdUrl) {
    targetUrl = `https://mtaiirus-api.onrender.com/api/pw/kid?mpdUrl=${encodeURIComponent(mpdUrl)}`;
  } else {
    return res.status(400).json({ error: "Invalid parameter" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Proxy failed" });
  }
}
