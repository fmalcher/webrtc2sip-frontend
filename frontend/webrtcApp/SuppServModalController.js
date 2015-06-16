(function(){
	'use strict';

	angular
		.module('webrtcApp')
		.controller('SuppServModalController', SuppServModalController);
	
	SuppServModalController.$inject = ['$scope', '$rootScope', 'scopeService', '$modalInstance'];
	
	function SuppServModalController($scope, $rootScope, scopeService, $modalInstance) {		
		
		$scope.suppServ = suppServ;
		$scope.fields = {};
		
		var onEventsSupp;
		var suppSession;


		
		///////////////////
		
		
		$scope.ok = function () {
			$modalInstance.close();
		};		
			    
	    
	    function onEventsSupp(e) {
			console.log("SUPP EVENT FIRED: " + e.type);
			
			switch (e.type) {
				case 'connected': {
					e.session.hangup();
					break;
				}
				
				case 'terminated': {
					break;
				}
			}
			
	    }
	    
	    
	    
		function suppServ(key){
			var suppSession = $rootScope.stack.newSession('call-audio', {
				events_listener: { events: '*', listener: onEventsSupp }
			});
			
			var to = null;
			
			if(key == 'cfuenable' && $scope.fields.cfudest){
				to = '*21*' + $scope.fields.cfudest + '%23';
			
			}else if(key == 'cfudisable'){
				to = '%2321%23';
			
			}else if(key == 'cfnrenable' && $scope.fields.cfnrdest){
				to = '*61*' + $scope.fields.cfnrdest + '%23';
			
			}else if(key == 'cfnrdisable'){
				to = '%2361%23';
			
			}else if(key == 'cfbenable' && $scope.fields.cfbdest){
				to = '*67*' + $scope.fields.cfbdest + '%23';
			
			}else if(key == 'cfbdisable'){
				to = '%2367%23';
			}
			
			console.log(to);
			
			if(to){
				suppSession.call(to);
			}
		}
	    		
	}

}());
