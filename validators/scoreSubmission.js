const config = require('../config')
const {
	sanitizeString,
	getFilledEvalEntries,
} = require('../utils/sections')

const POSITIVE_INT_PATTERN = /^\d+$/

function sanitizeUrl(value) {
	const trimmed = sanitizeString(value)
	if (!trimmed) return ''
	return trimmed.replace(/^https?:\/\//i, '').replace(/[<>"'`]/g, '')
}

function isPositiveInteger(value) {
	if (value === null || value === undefined) return false
	const normalized = String(value).trim()
	if (!POSITIVE_INT_PATTERN.test(normalized)) return false
	const parsed = Number(normalized)
	return Number.isSafeInteger(parsed) && parsed > 0
}

function isNonNegativeNumber(value) {
	if (value === null || value === undefined) return false
	const parsed = Number(value)
	return Number.isFinite(parsed) && parsed >= 0
}

function isPositiveNumber(value) {
	if (value === null || value === undefined) return false
	const parsed = Number(value)
	return Number.isFinite(parsed) && parsed > 0
}

function validateScoreSubmission(body) {
	const errors = []

	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return ['Request body must be a JSON object.']
	}

	if (!isPositiveInteger(body.Id_Test)) {
		errors.push('Id_Test must be a positive integer.')
	} else if (String(body.Id_Test).length > config.limits.idMaxDigits) {
		errors.push('Id_Test is too long.')
	}

	if (!isPositiveInteger(body.Id_Candidat_Externe)) {
		errors.push('Id_Candidat_Externe must be a positive integer.')
	} else if (String(body.Id_Candidat_Externe).length > config.limits.idMaxDigits) {
		errors.push('Id_Candidat_Externe is too long.')
	}

	if (
		body.URL_Acces_Candidature !== undefined &&
		body.URL_Acces_Candidature !== null &&
		body.URL_Acces_Candidature !== ''
	) {
		const sanitizedUrl = sanitizeUrl(String(body.URL_Acces_Candidature))
		if (sanitizedUrl.length > config.limits.accessUrlMaxLength) {
			errors.push('URL_Acces_Candidature is too long.')
		}
	}

	if (!Array.isArray(body.Eval)) {
		errors.push('Eval must be an array.')
		return errors
	}

	const filledEntries = getFilledEvalEntries(body.Eval)

	if (filledEntries.length === 0) {
		errors.push('At least one assessment entry must be filled.')
		return errors
	}

	const seenIdMatiere = new Set()

	for (const [index, entry] of filledEntries.entries()) {
		const label = `Eval[${index}]`

		if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
			errors.push(`${label} must be an object.`)
			continue
		}

		if (!isPositiveInteger(entry.Id_Matiere)) {
			errors.push(`${label}.Id_Matiere must be a positive integer.`)
		} else if (String(entry.Id_Matiere).length > config.limits.idMaxDigits) {
			errors.push(`${label}.Id_Matiere is too long.`)
		}

		if (isPositiveInteger(entry.Id_Matiere)) {
			const idMatiere = Number(entry.Id_Matiere)
			if (seenIdMatiere.has(idMatiere)) {
				errors.push(`Duplicate Id_Matiere: ${idMatiere}.`)
			} else {
				seenIdMatiere.add(idMatiere)
			}
		}

		if (!isNonNegativeNumber(entry.Score)) {
			errors.push(`${label}.Score must be zero or greater.`)
		}

		if (!isPositiveNumber(entry.Score_Max)) {
			errors.push(`${label}.Score_Max must be greater than zero.`)
		}

		if (
			isNonNegativeNumber(entry.Score) &&
			isPositiveNumber(entry.Score_Max) &&
			Number(entry.Score) > Number(entry.Score_Max)
		) {
			errors.push(`${label}.Score cannot exceed Score_Max.`)
		}

		if (
			entry.Instructeur !== undefined &&
			entry.Instructeur !== null &&
			entry.Instructeur !== ''
		) {
			const instructeur = sanitizeString(String(entry.Instructeur))
			if (instructeur.length > config.limits.instructorMaxLength) {
				errors.push(`${label}.Instructeur is too long.`)
			}
		}
	}

	return errors
}

function normalizeScoreSubmission(body) {
	const filledEntries = getFilledEvalEntries(body.Eval)

	return {
		Id_Test: Number(body.Id_Test),
		Id_Candidat_Externe: Number(body.Id_Candidat_Externe),
		URL_Acces_Candidature: sanitizeUrl(
			body.URL_Acces_Candidature ? String(body.URL_Acces_Candidature) : '',
		),
		Eval: filledEntries
			.slice()
			.sort((a, b) => Number(a.Id_Matiere) - Number(b.Id_Matiere))
			.map((entry) => ({
				Id_Matiere: Number(entry.Id_Matiere),
				Score: Number(entry.Score),
				Score_Max: Number(entry.Score_Max),
				Instructeur: sanitizeString(
					entry.Instructeur ? String(entry.Instructeur) : '',
				),
			})),
	}
}

module.exports = {
	validateScoreSubmission,
	normalizeScoreSubmission,
}
