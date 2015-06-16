(function(){
	'use strict';
	
	angular
		.module('webrtcApp')
		.config(routeConfig);
	
	
	function routeConfig($routeProvider) {
	
		$routeProvider.
			when('/', {
				controller: 'IndexController',
				template: '',
			}).
	
			when('/call', {
				templateUrl: 'webrtcApp/templates/call.html',
				controller: 'CallController',
			}).
			
			when('/accounts', {
				templateUrl: 'webrtcApp/templates/accounts.html',
				controller: 'AccountsController',
			});
			
	}
	

}());