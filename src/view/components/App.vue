<template>
	<div id="app">
  	<h1>{{test}}</h1>
  	<p>
    	<!-- use v-link directive for navigation. -->
  	</p>
  	<!-- route outlet -->
  	<router-view></router-view>
	</div>
</template>
<script>
let Store = require('../../store/Store.js');
export default {
	data() {
		return {
			test: '1'
		}
	}
}
</script>
<style></style>
