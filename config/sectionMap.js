// Maps frontend section_id (1-6) to Emlyon Id_Matiere values.
const SECTION_MAP = {
	1: 123,
	2: 124,
	3: 125,
	4: 126,
	5: 127,
	6: 128,
}

const REQUIRED_SECTION_IDS = Object.keys(SECTION_MAP).map(Number)

module.exports = {
	SECTION_MAP,
	REQUIRED_SECTION_IDS,
}
