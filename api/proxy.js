export default async function handler(req, res) {
  const { endpoint, ...params } = req.query;
  const targetUrl = `https://apiserver.deltastudy.site/api/pw/${endpoint}?${new URLSearchParams(params).toString()}`;
  
  const response = await fetch(targetUrl, {
    headers: { 'Referer': 'https://pw.live/', 'User-Agent': 'Mozilla/5.0' }
  });
  
  const data = await response.json();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(data);
}
