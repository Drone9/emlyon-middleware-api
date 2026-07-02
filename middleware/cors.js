const cors = require('cors')
const config = require('../config')

const corsOptions = {
	origin(origin, callback) {
		if (!origin || config.allowedOrigins.includes(origin)) {
			callback(null, true)
			return
		}

		callback(null, false)
	},
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type'],
}

module.exports = cors(corsOptions)
