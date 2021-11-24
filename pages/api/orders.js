export default async (req, res) => {
  let records = [];
  // console.log(req.query, req.body, req.method)
  if (req.query.role === 'admin' || req.body.role === 'admin') {
    if (req.method === 'GET') {
      records = await fetch(`${process.env.ORDERS_BACKEND}/api/v1/bills/orders?limit=${req.query.limit}&page=${req.query.page}&status=${req.query.status}&ifValue=${req.query.ifValue}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: req.headers.authorization,
        },
      });
    } else if (req.method === 'PATCH') {
      records = await fetch(
        `${process.env.ORDERS_BACKEND}/api/v1/bills/${req.body.id}`,
        {
          method: 'PATCH',
          mode: 'cors',
          headers: {
            Authorization: req.headers.authorization,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: req.body.status,
          }),
        }
      );
    } else if (req.method === 'DELETE') {
      // console.log(req.body.id)
      records = await fetch(
        `${process.env.ORDERS_BACKEND}/api/v1/bills/${req.body.id}`,
        {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );
    }
  } else if (req.query.role === 'user' || req.body.role === 'user') {
    // console.log(req.query)
    if (req.method === 'GET') {
      records = await fetch(`${process.env.ORDERS_BACKEND}/api/v1/bills/ownedOrders?limit=${req.query.limit}&page=${req.query.page}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: req.query.id,
          status: req.query.status,
          ifValue: req.query.ifValue,
        }),
      });
    } else if (req.method === 'PATCH') {
      // console.log(req.body)
      records = await fetch(
        `${process.env.ORDERS_BACKEND}/api/v1/bills/${req.body.billId}`,
        {
          method: 'PATCH',
          mode: 'cors',
          headers: {
            Authorization: req.headers.authorization,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isPaid: true,
          }),
        }
      );
    }
  } else {
    console.log('ERROR');
    res.status(401).json({
      status: 'failed',
    });
    return;
  }

  const data = await records.json();

  // console.log(data);
  if (records.ok) {
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
};
