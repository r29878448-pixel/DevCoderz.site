export default async function handler(req, res) {
  try {
    const { endpoint, ...params } = req.query;
    const queryString = new URLSearchParams(params).toString();
    const targetUrl = `https://apiserver.deltastudy.site/api/pw/${endpoint}?${queryString}`;

    // Browser se aaye hue headers (Auth Token) ko capture karein
    const authToken = req.headers['authorization'];

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': authToken || '',
        'Referer': 'https://pwthor.live/',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
