export default async (req, res) => {
    const result = await fetch(`${process.env.BACKEND}/api/v1/stats/linechart`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization': req.headers.authorization,
        }
    });

    const data = await result.json();

    if (result.ok) {
        res.status(200).json(data);
    } else {
        res.status(result.status).json(data);
    }
}