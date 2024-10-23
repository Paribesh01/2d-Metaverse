import express from 'express'
import router from './routes'
import { errorHandler } from './middleware/Error'

const app = express()


app.use(express.json())


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use("/api/v1", router)

app.use(errorHandler)

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})