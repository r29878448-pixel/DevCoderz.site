export default async function handler(req, res) {
    const { batchId, subjectSlug, topicSlug, contentType } = req.query;

    const targetUrl = `https://apiserver.deltastudy.site/api/pw/datacontent?batchId=${batchId}&subjectSlug=${subjectSlug}&topicSlug=${topicSlug}&contentType=${contentType || 'videos'}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://www.pw.live/' // Important: PW ko lagega traffic unki site se aa raha hai
            }
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Proxy failed" });
    }
}
