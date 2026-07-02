const axios = require('axios')
const config = require('../config')
const { getAccessToken } = require('./authService')
const { logSection, logInfo, logJson, logError } = require('../utils/logger')

function assertEmlyonConfig() {
	if (!config.emlyon.scoresUrl) {
		const error = new Error('Emlyon scores URL is not configured on the server.')
		error.statusCode = 503
		throw error
	}
}

async function submitScores(emlyonPayload) {
	assertEmlyonConfig()

	const accessToken = await getAccessToken()
	const url = config.emlyon.scoresUrl

	logSection('EMLYON SCORES REQUEST')
	logInfo('URL:', url)
	logInfo('Authorization:', `Bearer ${accessToken}`)
	logJson('Request body', emlyonPayload)

	try {
		const response = await axios.post(url, emlyonPayload, {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			timeout: config.emlyon.timeoutMs,
			validateStatus: () => true,
		})

		logSection('EMLYON SCORES RESPONSE')
		logInfo('Status:', response.status)
		logJson('Response body', response.data)

		if (response.status >= 200 && response.status < 300) {
			return {
				success: true,
				status: response.status,
				data: response.data,
			}
		}

		const error = new Error(
			`Emlyon API responded with status ${response.status}.`,
		)
		error.statusCode = 502
		error.details = response.data
		throw error
	} catch (error) {
		if (error.statusCode) {
			logError('Emlyon API error:', error.message)
			if (error.details) {
				logJson('Emlyon API error details', error.details)
			}
			throw error
		}

		if (error.code === 'ECONNABORTED') {
			const timeoutError = new Error('Emlyon API request timed out.')
			timeoutError.statusCode = 504
			logError(timeoutError.message)
			throw timeoutError
		}

		const upstreamError = new Error('Failed to reach Emlyon API.')
		upstreamError.statusCode = 502
		upstreamError.details = error.message
		logError(upstreamError.message, error.message)
		throw upstreamError
	}
}

module.exports = {
	submitScores,
}
