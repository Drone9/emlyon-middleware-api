const config = require('./config')
const app = require('./routes/route')
const { logInfo } = require('./utils/logger')

app.listen(config.port, () => {
	logInfo(`emlyon-middleware-api listening on port ${config.port}`)
})
