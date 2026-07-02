const axios = require('axios')
const config = require('../config')
const { logSection, logInfo, logJson, logError } = require('../utils/logger')

let cachedToken = null
let tokenExpiresAt = 0

function assertAzureConfig() {
	const { tenantId, clientId, clientSecret, scope } = config.azure

	if (!tenantId || !clientId || !clientSecret || !scope) {
		const error = new Error('Azure OAuth credentials are not configured on the server.')
		error.statusCode = 503
		throw error
	}
}

function buildTokenUrl() {
	return `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0/token`
}

async function getAccessToken() {
	assertAzureConfig()

	const now = Date.now()
	const refreshBufferMs = 60 * 1000

	if (cachedToken && now < tokenExpiresAt - refreshBufferMs) {
		logSection('AZURE TOKEN (CACHED)')
		logInfo('Using cached access token')
		logInfo('Token expires at:', new Date(tokenExpiresAt).toISOString())
		logInfo('Access token:', cachedToken)
		return cachedToken
	}

	const tokenUrl = buildTokenUrl()

	logSection('AZURE TOKEN REQUEST')
	logInfo('URL:', tokenUrl)
	logJson('Request body', {
		grant_type: 'client_credentials',
		client_id: config.azure.clientId,
		client_secret: '[REDACTED]',
		scope: config.azure.scope,
	})

	const body = new URLSearchParams({
		grant_type: 'client_credentials',
		client_id: config.azure.clientId,
		client_secret: config.azure.clientSecret,
		scope: config.azure.scope,
	})

	try {
		const response = await axios.post(tokenUrl, body.toString(), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			timeout: config.azure.timeoutMs,
			validateStatus: () => true,
		})

		logSection('AZURE TOKEN RESPONSE')
		logInfo('Status:', response.status)
		logJson('Response body', {
			...response.data,
			access_token: response.data?.access_token || null,
		})

		if (response.status < 200 || response.status >= 300) {
			const error = new Error('Failed to obtain Azure access token.')
			error.statusCode = 502
			error.details = response.data
			throw error
		}

		if (!response.data?.access_token) {
			const error = new Error('Azure token response did not include an access token.')
			error.statusCode = 502
			throw error
		}

		const expiresInSeconds = Number(response.data.expires_in) || 3600
		cachedToken = response.data.access_token
		tokenExpiresAt = now + expiresInSeconds * 1000

		logInfo('Access token:', cachedToken)
		logInfo('Token expires at:', new Date(tokenExpiresAt).toISOString())

		return cachedToken
	} catch (error) {
		if (error.statusCode) {
			logError('Azure token error:', error.message)
			if (error.details) {
				logJson('Azure token error details', error.details)
			}
			throw error
		}

		if (error.code === 'ECONNABORTED') {
			const timeoutError = new Error('Azure token request timed out.')
			timeoutError.statusCode = 504
			logError(timeoutError.message)
			throw timeoutError
		}

		const authError = new Error('Failed to reach Azure token endpoint.')
		authError.statusCode = 502
		authError.details = error.message
		logError(authError.message, error.message)
		throw authError
	}
}

function clearTokenCache() {
	cachedToken = null
	tokenExpiresAt = 0
}

module.exports = {
	getAccessToken,
	clearTokenCache,
}
