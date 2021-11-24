const opennode = require('opennode');
opennode.setCredentials(process.env.OPENNODE_DEV_INVOICE, 'dev');

export default async (req, res) => {
    // console.log(JSON.parse(req.body));
    const bodyObj = JSON.parse(req.body);
    // const price = parseInt(req.body.amount);
    // console.log(bodyObj);
    try {
        const charge = await opennode.createCharge({
            description: `${bodyObj.dishNames}`,
            amount: bodyObj.amount * 1, // required
            currency: 'USD',
            order_id: bodyObj.billId,
            customer_name: bodyObj.customer,
            customer_email: bodyObj.email,
            notif_email: bodyObj.email,
            // callback_url: "https://example.com/webhook/opennode",
            // success_url: 'https://example.com/order/abc123',
            auto_settle: false          
        });
        // console.log(charge);
        res.status(200).json(charge);
      }
      catch (error) {
        console.error(`${error.status} | ${error.message}`);
        res.status(400).json({error: error.message});
      }
}
