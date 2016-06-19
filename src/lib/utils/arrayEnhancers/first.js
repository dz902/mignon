function first(arr) {
	if (Array.isArray(arr) && arr.length > 0) {
		return arr[0];
	} else {
		return undefined;
	}
}

module.exports = first;
