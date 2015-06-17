angular.module('webrtcApp')
	.service('accountService', function($http, appConfig, $rootScope) {

	this.list = function() {
		return $http.get(appConfig.backend + '/account');
	}
	
	this.getOne = function(id) {
		return $http.get(appConfig.backend + '/account/' + id);
	}
	
	this.delete = function(id) {
		return $http.delete(appConfig.backend + '/account/' + id);
	}
});