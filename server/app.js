import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import question from './app/question.js'
import user from './app/user.js'

dotenv.config()

const app = express()

const port = process.env.PORT || 4012

app.use(bodyParser.json())
app.use(cors())
app.get('/', (req,res) => {
    res.send("Hello world")
})
app.use('/users', user)
app.use('/question', question)

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})