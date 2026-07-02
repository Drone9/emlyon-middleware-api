require('dotenv').config()

const { SECTION_MAP, REQUIRED_SECTION_IDS } = require('./sectionMap')

function parseAllowedOrigins() {
	const raw = process.env.ALLOWED_ORIGINS || 'http://localhost:5173'
	return raw
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean)
}

function buildEmlyonScoresUrl() {
	if (process.env.EMLYON_SCORES_URL) {
		return process.env.EMLYON_SCORES_URL.replace(/\/$/, '') + '/'
	}

	const apiUrl = (process.env.EMLYON_API_URL || '').replace(/\/$/, '')
	const scoresPath = process.env.EMLYON_SCORES_PATH || '/services/resultats_mereos'

	if (!apiUrl) {
		return ''
	}

	return `${apiUrl}${scoresPath.startsWith('/') ? scoresPath : `/${scoresPath}`}/`
}

const config = {
	port: Number(process.env.PORT) || 3001,
	nodeEnv: process.env.NODE_ENV || 'development',
	allowedOrigins: parseAllowedOrigins(),
	azure: {
		tenantId: process.env.AZURE_TENANT_ID || '',
		clientId: process.env.AZURE_CLIENT_ID || '',
		clientSecret: process.env.AZURE_CLIENT_SECRET || '',
		scope: process.env.AZURE_SCOPE || '',
		timeoutMs: Number(process.env.AZURE_TOKEN_TIMEOUT_MS) || 15000,
	},
	emlyon: {
		scoresUrl: buildEmlyonScoresUrl(),
		timeoutMs: Number(process.env.EMLYON_API_TIMEOUT_MS) || 15000,
	},
	limits: {
		jsonBodySize: '32kb',
		instructorMaxLength: 120,
		accessUrlMaxLength: 500,
		idMaxDigits: 12,
	},
	sectionMap: SECTION_MAP,
	requiredSectionIds: REQUIRED_SECTION_IDS,
}

module.exports = config
