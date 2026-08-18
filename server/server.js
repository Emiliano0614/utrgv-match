require('dotenv').config()
const createApp = require('./app')

async function start() {
    const app = await createApp()
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}

start().catch((error) => {
    console.error('Failed to start server', error)
    process.exit(1)
})
