import express from 'express';

const app = express()
const port = 3000

app.post('/create-link', (req, res) => {

})

app.listen(port, () => {
    console.log(`Listen on port ${port}`)
})
