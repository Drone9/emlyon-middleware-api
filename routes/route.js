const express = require('express')
const helmet = require('helmet')
const config = require('../config')
const corsMiddleware = require('../middleware/cors')
const { limiter, submitScoreLimiter } = require('../middleware/rateLimiter')
const { notFoundHandler, errorHandler } = require('../middleware/errorHandler')
const {
	validateScoreSubmission,
	normalizeScoreSubmission,
} = require('../validators/scoreSubmission')
const { toEmlyonPayload } = require('../utils/mapper')
const { submitScores } = require('../services/emlyonClient')
const { logSection, logInfo, logJson, logError } = require('../utils/logger')

const router = express.Router()

router.get(['/', '/health'], (req, res) => {
	logSection('MIDDLEWARE API - HEALTH')
	logInfo(`${req.method} ${req.originalUrl}`)

	const responseBody = {
		success: true,
		message: 'API health is fine.',
	}

	logJson('Response body', responseBody)
	res.json(responseBody)
})

router.get('/api/info', (req, res) => {
	logSection('MIDDLEWARE API - INFO')
	logInfo(`${req.method} ${req.originalUrl}`)

	const responseBody = {
		application: 'emlyon-middleware-api',
		version: '1.0.0',
	}

	logJson('Response body', responseBody)
	res.json(responseBody)
})

router.post(
	'/api/scores',
	submitScoreLimiter,
	async (req, res, next) => {
		try {
			logSection('MIDDLEWARE API - SUBMIT SCORES')
			logInfo(`${req.method} ${req.originalUrl}`)
			logJson('Incoming request body', req.body)

			const validationErrors = validateScoreSubmission(req.body)

			if (validationErrors.length > 0) {
				logError('Validation failed', validationErrors)

				res.status(400).json({
					success: false,
					message: 'Validation failed.',
					errors: validationErrors,
				})
				return
			}

			const normalizedPayload = normalizeScoreSubmission(req.body)
			logJson('Normalized middleware payload', normalizedPayload)

			const emlyonPayload = toEmlyonPayload(normalizedPayload)
			logJson('Mapped Emlyon payload', emlyonPayload)

			const upstreamResponse = await submitScores(emlyonPayload)

			const responseBody = {
				success: true,
				message: 'Scores submitted successfully.',
				data: upstreamResponse.data,
			}

			logSection('MIDDLEWARE API - SUBMIT SCORES RESPONSE')
			logInfo('Status:', 200)
			logJson('Response body', responseBody)

			res.status(200).json(responseBody)
		} catch (error) {
			logSection('MIDDLEWARE API - SUBMIT SCORES ERROR')
			logError(error.message)
			if (error.details) {
				logJson('Error details', error.details)
			}
			next(error)
		}
	},
)

function createApp() {
	const app = express()

	app.disable('x-powered-by')
	app.use(helmet())
	app.use(limiter)
	app.use(corsMiddleware)
	app.use(express.json({ limit: config.limits.jsonBodySize }))
	app.use(express.urlencoded({ extended: false, limit: config.limits.jsonBodySize }))
	app.use(router)
	app.use(notFoundHandler)
	app.use(errorHandler)

	return app
}

module.exports = createApp()
