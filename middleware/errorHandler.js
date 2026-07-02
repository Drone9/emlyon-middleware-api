const { logError, logJson } = require('../utils/logger')

function notFoundHandler(req, res) {
	res.status(404).json({
		success: false,
		message: 'Route not found.',
	})
}

function errorHandler(error, req, res, next) {
	if (res.headersSent) {
		next(error)
		return
	}

	const statusCode = error.statusCode || 500
	const isServerError = statusCode >= 500

	logError('API error response', {
		message: error.message,
		statusCode,
		path: req.originalUrl,
		method: req.method,
	})
	if (error.details) {
		logJson('API error details', error.details)
	}

	res.status(statusCode).json({
		success: false,
		message: isServerError ? 'Internal server error.' : error.message,
		...(error.details && !isServerError ? { details: error.details } : {}),
	})
}

module.exports = {
	notFoundHandler,
	errorHandler,
}
