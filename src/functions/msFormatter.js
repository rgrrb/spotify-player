function formatMilliseconds(milliseconds){
	let formattedString = ""

	const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
	milliseconds %= 1000 * 60 * 60 * 24

	const hours = Math.floor(milliseconds / (1000 * 60 * 60))
	milliseconds %= 1000 * 60 * 60

	const minutes = Math.floor(milliseconds / (1000 * 60))
	milliseconds %= 1000 * 60

	const seconds = Math.floor(milliseconds / 1000)

	if (hours > 0) {
		formattedString += `${hours.toString().padStart(2, "0")}h `
	}

	if (minutes > 0) {
		formattedString += `${minutes.toString().padStart(2, "0")}:`
	}

	if (seconds > 0) {
		formattedString += `${seconds.toString().padStart(2, "0")}`
	}

	return formattedString
}
