export default async(req, res) => {
    // console.log(req.body);
    const data = await fetch(`${process.env.BACKEND}/api/v1/payment/checkout`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            Authorization: `Bearer ${req.headers.authorization}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "ids": req.body.ids,
            "customer": req.body.customer,
            "receipt_email": req.body.email,
            "billId": req.body.billId,
            "description": req.body.dishNames
        })
    })

    const client_secret = await data.json()
    // console.log(client_secret)
    res.status(200).json({ data: client_secret })
}