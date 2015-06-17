(function(){
	'use strict';

	angular.module('webrtcApp')
		.controller('AccountsController', AccountsController);
	
	AccountsController.$inject = ['$scope', 'accountService', '$modal', '$rootScope'];
	function AccountsController($scope, accountService, $modal, $rootScope) {
		
		$scope.refresh = refresh;
		function refresh() {
			accountService.list().then(function(d){
				$scope.accounts = d.data;
			});
		}
		refresh();
		
		
		
		
		$scope.removeAcc = function(accid) {
			var acc = $scope.accounts[accid];
			
			var modal = $modal.open({
				templateUrl: 'webrtcApp/templates/accDeleteModal.html',
				controller: function($scope) {
					$scope.account = acc;
				},
			});
	
			modal.result.then(function() {
				accountService.delete(accid).then(function(d){
					refresh();
					$rootScope.$broadcast('accountsUpdated');
				});
			});
		}
		
		
		
	}
	
	
	
	
	
	
	
	
	

}());