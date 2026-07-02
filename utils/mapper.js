const config = require('../config')

function toEmlyonPayload(body) {
	return {
		Id_Test: body.test_id,
		Id_Candidat_Externe: body.candidate_id,
		URL_Acces_Candidature: body.access_url || '',
		Eval: body.sections.map((section) => ({
			Id_Matiere: config.sectionMap[section.section_id],
			Score: section.obtained_score,
			Score_Max: section.total_score,
			Instructeur: section.instructor || '',
		})),
	}
}

module.exports = {
	toEmlyonPayload,
}
