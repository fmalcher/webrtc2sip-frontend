(function(){
	'use strict';

	angular.module('webrtcApp')
		.controller('CallController', CallController);
	
	CallController.$inject = ['$scope', '$rootScope', '$modal', 'scopeService', 'ngAudio', 'appConfig'];
	
	function CallController($scope, $rootScope, $modal, scopeService, ngAudio, appConfig) {		
		

		$scope.sipCall = sipCall;
		$scope.sipCallAnswer = sipCallAnswer;
		$scope.sipHangup = sipHangup;
		$scope.sipTransfer = sipTransfer;
		$scope.sipHold = sipHold;
		$scope.sipResume = sipResume;
		
		$scope.callOptions = {
			calleeNumber: appConfig.defaultCalleeNumber,
			enableOIR: false
		};
		



		
		///////////////////
		

		
			    
	    // makes a call (SIP INVITE)
	    function sipCall() {
	        if($rootScope.stack && !$rootScope.callSession) {

	            // create call session
	            var thisCallConfig = $rootScope.callConfig;
	            
	            //OIR is enabled, hide my number
	            if($scope.callOptions.enableOIR){
		            
		            thisCallConfig.sip_headers = [
						{ name: 'P-Preferred-Identity', value: '<' + $rootScope.account.cred.impu + '>', session: false },
						{ name: 'Privacy', value: 'header', session: false }
					];
		            
				}else{
					thisCallConfig.sip_headers = [];
				}
	            
	            $rootScope.callSession = $rootScope.stack.newSession('call-audio', thisCallConfig);
	            // make call
	            if($rootScope.callSession.call($scope.callOptions.calleeNumber) != 0){
	                $rootScope.callSession = null;
	                return;
	            }
	        }
	    }
	    
	    
	    


	    
	    function sipCallAnswer() {
		    if($rootScope.callSession) {
	            $rootScope.callSession.accept($rootScope.callConfig);
	        }
	        return;
	    }
	    
	    
	    
	    function sipHangup() {
		    if($rootScope.callSession) {
			    $rootScope.callSession.hangup();
		    }
	    }
	    
	    
	    function sipHold() {
		    if($rootScope.callSession) {
			    $rootScope.callSession.hold();
			    setAppState("hold", 1);
		    }
	    }
	    
	    function sipResume() {
		    if($rootScope.callSession) {
			    $rootScope.callSession.resume();
			    setAppState("hold", 0);
		    }
	    }
	    
	    


		function sipTransfer() {
	        if($rootScope.callSession) {
	            var destNumber = prompt('Enter destination number', '');
	            console.log("Now initiating transfer to " + destNumber);
	            if(destNumber) {
		            
	                if($rootScope.callSession.transfer(destNumber) != 0) {
						$scope.alert = "Call forwarding failed..."
	                    return;
	                }
	            }
	        }
	    }
	    
	    
	    
	    
	    $scope.openSuppModal = function() {
			var modalInstance = $modal.open({
				templateUrl: 'webrtcApp/templates/suppServModal.html',
				controller: 'SuppServModalController'
			});

  		};
	    
	    


	}

}());
