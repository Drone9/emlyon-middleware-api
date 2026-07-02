function sanitizeString(value) {
	if (typeof value !== 'string') return ''
	return value.trim().replace(/\s+/g, ' ')
}

function hasEvalFieldValue(value) {
	if (value === null || value === undefined) return false
	return String(value).trim() !== ''
}

function isEvalEntryFilled(entry) {
	return (
		hasEvalFieldValue(entry.Id_Matiere) ||
		hasEvalFieldValue(entry.Score) ||
		hasEvalFieldValue(entry.Score_Max) ||
		hasEvalFieldValue(entry.Instructeur)
	)
}

function getFilledEvalEntries(entries) {
	if (!Array.isArray(entries)) return []
	return entries.filter(isEvalEntryFilled)
}

module.exports = {
	sanitizeString,
	hasEvalFieldValue,
	isEvalEntryFilled,
	getFilledEvalEntries,
}
