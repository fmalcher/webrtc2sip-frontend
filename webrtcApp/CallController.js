(function(){
	'use strict';

	angular
		.module('webrtcApp')
		.controller('CallController', CallController);
	
	CallController.$inject = ['$scope'];
	
	function CallController($scope) {		
		$scope.stack = null;
		$scope.eventsListener = eventsListener;
		
		var registerSession;
		
		init();
		
		
		
		
		function init(){
			var readyCallback = function(e){
				createSipStack();
			};
			var errorCallback = function(e){
				console.error('Failed to initialize the engine: ' + e.message);
			}
			
			SIPml.init(readyCallback, errorCallback);

		}
		
		
		function eventsListener(e){
			if(e.type == 'started'){
				login();
			}
			else if(e.type == 'i_new_call'){ // incoming audio/video call
				//acceptCall(e);
			}
		}
		
		
		
		function login(){
			registerSession = $scope.stack.newSession('register', {
				events_listener: { events: '*', listener: eventsListener } // optional: '*' means all events
			});
			registerSession.register();
		}
		
		
		
		
		function createSipStack(){
			$scope.stack = new SIPml.Stack({
				realm: SIPcred.realm,
				impi: SIPcred.impi,
				impu: SIPcred.impu,
				password: SIPcred.password,
				display_name: '',
				websocket_proxy_url: 'ws://192.168.178.37:10060',
				outbound_proxy_url: '',
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
