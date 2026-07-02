const config = require('../config')
const {
	sanitizeString,
	getFilledSections,
	isAllowedSectionId,
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

	if (!isPositiveInteger(body.test_id)) {
		errors.push('test_id must be a positive integer.')
	} else if (String(body.test_id).length > config.limits.idMaxDigits) {
		errors.push('test_id is too long.')
	}

	if (!isPositiveInteger(body.candidate_id)) {
		errors.push('candidate_id must be a positive integer.')
	} else if (String(body.candidate_id).length > config.limits.idMaxDigits) {
		errors.push('candidate_id is too long.')
	}

	if (body.access_url !== undefined && body.access_url !== null && body.access_url !== '') {
		const sanitizedUrl = sanitizeUrl(String(body.access_url))
		if (sanitizedUrl.length > config.limits.accessUrlMaxLength) {
			errors.push('access_url is too long.')
		}
	}

	if (!Array.isArray(body.sections)) {
		errors.push('sections must be an array.')
		return errors
	}

	const filledSections = getFilledSections(body.sections)

	if (filledSections.length === 0) {
		errors.push('At least one assessment section must be filled.')
		return errors
	}

	const seenSectionIds = new Set()

	for (const [index, section] of filledSections.entries()) {
		const label = `sections[${index}]`

		if (!section || typeof section !== 'object' || Array.isArray(section)) {
			errors.push(`${label} must be an object.`)
			continue
		}

		if (!isAllowedSectionId(section.section_id)) {
			errors.push(
				`${label}.section_id must be one of: ${config.requiredSectionIds.join(', ')}.`,
			)
		}

		if (seenSectionIds.has(section.section_id)) {
			errors.push(`Duplicate section_id: ${section.section_id}.`)
		} else {
			seenSectionIds.add(section.section_id)
		}

		if (!isNonNegativeNumber(section.obtained_score)) {
			errors.push(`${label}.obtained_score must be zero or greater.`)
		}

		if (!isPositiveNumber(section.total_score)) {
			errors.push(`${label}.total_score must be greater than zero.`)
		}

		if (
			isNonNegativeNumber(section.obtained_score) &&
			isPositiveNumber(section.total_score) &&
			Number(section.obtained_score) > Number(section.total_score)
		) {
			errors.push(`${label}.obtained_score cannot exceed total_score.`)
		}

		if (section.instructor !== undefined && section.instructor !== null && section.instructor !== '') {
			const instructor = sanitizeString(String(section.instructor))
			if (instructor.length > config.limits.instructorMaxLength) {
				errors.push(`${label}.instructor is too long.`)
			}
		}
	}

	return errors
}

function normalizeScoreSubmission(body) {
	const filledSections = getFilledSections(body.sections)

	return {
		test_id: Number(body.test_id),
		candidate_id: Number(body.candidate_id),
		access_url: sanitizeUrl(body.access_url ? String(body.access_url) : ''),
		sections: filledSections
			.slice()
			.sort((a, b) => a.section_id - b.section_id)
			.map((section) => ({
				section_id: Number(section.section_id),
				obtained_score: Number(section.obtained_score),
				total_score: Number(section.total_score),
				instructor: sanitizeString(
					section.instructor ? String(section.instructor) : '',
				),
			})),
	}
}

module.exports = {
	validateScoreSubmission,
	normalizeScoreSubmission,
}
