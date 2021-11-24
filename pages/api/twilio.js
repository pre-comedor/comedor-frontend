const accountSid = 'ACd284e813eeae6da68319666a962f47d3';
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export default async (req, res) => {
    // console.log(req.body)
    client.messages
    .create({
        body: req.body.msg,
        messagingServiceSid: 'MGea76f5e9e32111b1a302b97e121e5360',
        to: `+503${req.body.tn}`
    })
    .then(message => res.status(200).json({
        status: 'success',
        sid: message.sid
    }))
    .done();
}