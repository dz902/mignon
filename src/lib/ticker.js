function tick(state) {
	var nextTick = state.get('tick') + performance.now();

	return state.set('tick', nextTick);
}
