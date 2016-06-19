function last(arr) {
	return Array.isArray(arr) && arr.length > 0 ? 
		     arr[arr.length-1] : undefined;
}

module.exports = last;
