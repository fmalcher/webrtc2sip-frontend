(function(){
	'use strict';

	angular
		.module('webrtcApp')
		.controller('IndexController', IndexController);
	
	IndexController.$inject = ['$location'];
	
	function IndexController($location) {
		$location.path('/call');
		
	}

}());