export default async (req, res) => {
    // console.log(req.body)
    //POST request to inser data to google spreeadsheet
        const result = await fetch(`${process.env.SPREED_SHEET}`,{
            method: 'POST',
            headers: {
                'X-Api-Key': process.env.API_KEY,
                'Content-Type': 'application/json'
            },
            body: req.body
        })
        const data = await result.json();
        // console.log(data)
        res.status(200).json(data)
  }