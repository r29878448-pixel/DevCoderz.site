export default async function handler(req, res) {
  try {
    const { endpoint, ...params } = req.query;
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`https://apiserver.deltastudy.site/api/pw/${endpoint}?${queryString}`);
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
