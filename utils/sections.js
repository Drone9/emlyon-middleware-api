const config = require('../config')

function sanitizeString(value) {
	if (typeof value !== 'string') return ''
	return value.trim().replace(/\s+/g, ' ')
}

function hasSectionFieldValue(value) {
	if (value === null || value === undefined) return false
	return String(value).trim() !== ''
}

function isSectionFilled(section) {
	return (
		hasSectionFieldValue(section.obtained_score) ||
		hasSectionFieldValue(section.total_score) ||
		hasSectionFieldValue(section.instructor)
	)
}

function getFilledSections(sections) {
	if (!Array.isArray(sections)) return []
	return sections.filter(isSectionFilled)
}

function isAllowedSectionId(sectionId) {
	return config.requiredSectionIds.includes(Number(sectionId))
}

module.exports = {
	sanitizeString,
	hasSectionFieldValue,
	isSectionFilled,
	getFilledSections,
	isAllowedSectionId,
}
