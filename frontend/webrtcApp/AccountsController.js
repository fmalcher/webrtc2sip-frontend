(function(){
	'use strict';

	angular
		.module('webrtcApp')
		.controller('AccountsController', AccountsController);
	
	AccountsController.$inject = ['$scope', 'accountService'];
	
	function AccountsController($scope, accountService) {
		
		
		accountService.list().then(function(d){
			$scope.accounts = d.data;
		});
	}

}());