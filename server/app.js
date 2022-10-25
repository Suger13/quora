import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req,res) => {
    res.send(`Hello world`)
})

const port = process.env.PORT || 4012

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
