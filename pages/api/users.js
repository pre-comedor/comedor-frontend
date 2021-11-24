export default async (req, res) => {
    let users = '';
    // console.log(req.query.id);
    if (req.method === 'GET') {
        //Fetch users from /api/v1/users
        users = await fetch(`${process.env.BACKEND}/api/v1/users?limit=${req.query.limit}&page=${req.query.page}&sort=${req.query.sort}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                Authorization: req.headers.authorization,
            },
        });
    }
    else if (req.method === 'PATCH') {
        users = await fetch(`${process.env.BACKEND}/api/v1/users/${req.query.id}?limit=${req.query.limit}&page=${req.query.page}&sort=${req.query.sort}`, {
            method: 'PATCH',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization,
            },
            body: JSON.stringify({
                canBorrow: req.body.fiar,
            })
        });
    }

    const data = await users.json();
    // console.log(data);
    if (users.ok) {
        res.status(201).json({
            status: 'success',
            data,
        });
    } else {
        res.status(401).json({
            status: 'failed',
            data: {
                message: data.message[0].message,
            },
        });
    }
}