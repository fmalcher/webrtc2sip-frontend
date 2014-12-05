(function(){
	'use strict';

	angular
		.module('webrtcApp')
		.controller('CallController', CallController);
	
	CallController.$inject = ['$scope'];
	
	function CallController($scope) {		
		$scope.stack = null;
		
		$scope.initialized = 0;
		$scope.registered = 0;
		
		$scope.eventsListener = eventsListener;
		$scope.createSipStack = createSipStack;
		$scope.sipUnregister = sipUnregister;
		
		var registerSession;
		
		///////////////////
		
		init();

		
		
		function init(){
			var readyCallback = function(e){
				$scope.initialized = 1;
				//createSipStack();
			};
			var errorCallback = function(e){
				console.error('Failed to initialize the engine: ' + e.message);
			}
			
			SIPml.init(readyCallback, errorCallback);

		}
		
		
		function eventsListener(e){
			if(e.type == 'started'){
				sipRegister();
			}
			else if(e.type == 'i_new_call'){ // incoming audio/video call
				//acceptCall(e);
			}
		}
		
		
		
		function sipRegister(){
			var retval;
			
			registerSession = $scope.stack.newSession('register', {
				events_listener: { events: '*', listener: eventsListener } // optional: '*' means all events
			});
			retval = registerSession.register();
			if(retval) $scope.registered = 1;
		}
		
		
		function sipUnregister(){
			if($scope.stack) {
				$scope.stack.stop();
			}
		}
		
		
		
		
		function createSipStack(){
			$scope.stack = new SIPml.Stack({
				realm: SIPcred.realm,
				impi: SIPcred.impi,
				impu: SIPcred.impu,
				password: SIPcred.password,
				display_name: '',
				websocket_proxy_url: SIPcred.websocket_proxy_url,
				outbound_proxy_url: SIPcred.outbound_proxy_url,
				ice_servers: SIPcred.ice_servers, 
				enable_rtcweb_breaker: true,
				events_listener: { events: '*', listener: $scope.eventsListener },
				sip_headers: [
					{ name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0' },
					{ name: 'Organization', value: 'HfTL' }
				]
			});
			
			$scope.stack.start();
		}
		
	}

}());
