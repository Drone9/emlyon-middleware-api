const config = require('../config')

function isDevelopment() {
	return config.nodeEnv === 'development'
}

function timestamp() {
	return new Date().toISOString()
}

function logSection(title) {
	if (!isDevelopment()) return

	console.log(`\n[${timestamp()}] ========== ${title} ==========`)
}

function logInfo(message, data) {
	if (!isDevelopment()) return

	if (data !== undefined) {
		console.log(`[${timestamp()}] ${message}`, data)
		return
	}

	console.log(`[${timestamp()}] ${message}`)
}

function logJson(label, data) {
	if (!isDevelopment()) return

	console.log(`[${timestamp()}] ${label}:`)
	console.log(JSON.stringify(data, null, 2))
}

function logError(message, data) {
	if (!isDevelopment()) return

	if (data !== undefined) {
		console.error(`[${timestamp()}] ${message}`, data)
		return
	}

	console.error(`[${timestamp()}] ${message}`)
}

module.exports = {
	logSection,
	logInfo,
	logJson,
	logError,
}
