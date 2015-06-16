angular.module('webrtcApp')
	.service('accountService', function($http, appConfig) {

	this.list = function() {
		return $http.get(appConfig.backend + '/account');
	}
	
	this.getOne = function(id) {
		return $http.get(appConfig.backend + '/account/' + id);
	}
});