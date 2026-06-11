export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { batch_id, subject_id, topic_id, tab } = req.query;

    if (!batch_id || !subject_id || !topic_id) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        // Delta API Structure
        const targetUrl = `https://apiserver.deltastudy.site/api/pw/datacontent?batchId=${encodeURIComponent(batch_id)}&subjectSlug=${encodeURIComponent(subject_id)}&topicSlug=${encodeURIComponent(topic_id)}&contentType=${encodeURIComponent(tab || 'videos')}`;

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Delta API unreachable");

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch from Delta API" });
    }
}
