(function(){
	'use strict';

	angular.module('webrtcApp')
		.controller('MainController', MainController);
	
	MainController.$inject = ['$scope', '$rootScope', 'scopeService', 'ngAudio', '$modal', 'appConfig', 'accountService'];
	
	function MainController($scope, $rootScope, scopeService, ngAudio, $modal, appConfig, accountService) {		
		
		
		$scope.refreshAccounts = function() {
			
			//get account list
			accountService.list().then(function(d){
				$scope.accounts = d.data;
				
				if(!Object.keys($scope.accounts).length) return; //end function if there are no accounts
				
														
				var defaultId;
				
				//if there's an account in rootScope check whether it is still available. If not available or no acc in rootScope, choose first one as default.
				if($rootScope.account && $scope.accounts.hasOwnProperty($rootScope.account.id)) {
					defaultId = $rootScope.account.id;
				} else {
					defaultId = Object.keys($scope.accounts)[0];
				}
				
				accountService.getOne(defaultId).then(function(d){
					$rootScope.account = d.data;
				});
			});
		}
		$scope.refreshAccounts();
		
		
		$scope.$on('accountsUpdated', function(){
			$scope.refreshAccounts();
		});
		
		


		$rootScope.stack = null;

		$rootScope.appState = {
			initializing: 0,
			initialized: 0,
			registering: 0,
			registered: 0,
			unregistering: 0,
			incomingCall: 0,
			outgoingCall: 0,
			call: 0,
			hold: 0,
			held: 0,
			resume: 0
		};
		
		
		$scope.sound = {};
		$scope.sound.calling = ngAudio.load('media/calling.mp3');
		$scope.sound.calling.loop = true;
		
		$scope.sound.ringing = ngAudio.load('media/ringing.mp3');
		$scope.sound.ringing.loop = true;

		
		
		var registerSession;		
		
		init();

		
		$rootScope.setAppState = setAppState;
		function setAppState(key, val){
		    scopeService.safeApply($rootScope, function(){
			    $rootScope.appState[key] = val;
		    });
		    return;
	    }
		
		
		$scope.setAccount = function(id){
			accountService.getOne(id).then(function(d){
				sipUnregister();
				$rootScope.account = d.data;
				//createSipStack();
			});
			
		}
		
		
		
		function init(){
			var readyCallback = function(e){
				setAppState('initialized', 1);
			};
			var errorCallback = function(e){
				console.error('Failed to initialize the engine: ' + e.message);
			}
			
			SIPml.init(readyCallback, errorCallback);

		}

		$scope.sipUnregister = sipUnregister;
		function sipUnregister(){
			if(!$rootScope.stack) return false;
			
			setAppState('unregistering', 1);
			
			if(registerSession) {
				registerSession.unregister();
			}else{
				$rootScope.stack.stop();
			}
		}
		
		
		$scope.createSipStack = createSipStack;
		function createSipStack(){
			
			var cred = $rootScope.account.cred;
			
			$rootScope.stack = new SIPml.Stack({
				realm: cred.realm,
				impi: cred.impi,
				impu: cred.impu,
				password: cred.password,
				display_name: '',
				websocket_proxy_url: appConfig.websocket_proxy_url,
				outbound_proxy_url: appConfig.outbound_proxy_url,
				ice_servers: appConfig.ice_servers, 
				enable_rtcweb_breaker: true,
				events_listener: { events: '*', listener: onEventsStack },
				sip_headers: [
					{ name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0' },
					//{ name: 'Organization', value: 'HfTL' }
				]
			});
			
			$rootScope.stack.start();
			
		}

	    function onEventsStack(e) {
	        console.log("STACK EVENT FIRED: " + e.type);
	        
	        switch (e.type) {
	            
	            case 'started': {

                    //catch exception for IE (DOM not ready)
                    try {
                        // LogIn (REGISTER) as soon as the stack finish starting
                        registerSession = $rootScope.stack.newSession('register', {
                            expires: 86400,
                            events_listener: { events: '*', listener: onEventsRegister },
                            /*sip_caps: [
                                { name: '+g.oma.sip-im', value: null },
                                { name: '+audio', value: null },
                                { name: 'language', value: '\"en,de\"' }
                            ]*/
                        });
                        registerSession.register();
                    }
                    catch (e) {
	                    
                    }
                    break;
	            }
	            
	            case 'stopped': {
		            setAppState('registered', 0);
		            setAppState('registering', 0);
		            setAppState('unregistering', 0);
		            setAppState('call', 0);
		            setAppState('incomingCall', 0);
		            setAppState('outgoingCall', 0);
		            setAppState('hold', 0);
		            setAppState('held', 0);
		            setAppState('resume', 0);
		            
		            break;
	            }
	            
	            
	            case 'stopping': case 'failed_to_start': case 'failed_to_stop': {
                    var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
                    
                    $rootScope.stack = null;
                    registerSession = null;
                    $rootScope.callSession = null;
                    $rootScope.suppSession = null;

                    $scope.sound.calling.stop();
                    $scope.sound.ringing.stop();
                    break;
                }
	
	            case 'i_new_call': {
                    if($rootScope.callSession) { //do not accept incoming call if there's another active callSession
                        e.newSession.hangup();
                    } else {
                        $rootScope.callSession = e.newSession;
                        $rootScope.callSession.setConfiguration($rootScope.callConfig);

                        var sRemoteNumber = ($rootScope.callSession.getRemoteFriendlyName() || 'unknown');
                        
                        console.log("INCOMING CALL: " + sRemoteNumber);
                        
                        setAppState('incomingCall', 1);
                        $scope.sound.ringing.play();
                    }
                    break;
                }
	
	            case 'starting': default: break;
	        }
	    };
	
	
	
		function onEventsRegister(e){
			console.log("REGISTER EVENT FIRED: " + e.type);
			
			
			switch (e.type) {
				
				case 'connecting': {
	               	setAppState('registering', 1);
					break;
				}
				
				case 'connected': {
	               	setAppState('registering', 0);
	               	setAppState('registered', 1);
					break;
				}
				
				case 'terminated': {
					$rootScope.stack.stop();
				}
			}
		}
	
	
	


		    
		var audioRemote = document.getElementById('audio_remote');

		$rootScope.callConfig = {
            audio_remote: audioRemote,
			bandwidth: { audio:undefined, video:undefined },
            events_listener: { events: '*', listener: onEventsCall },
            sip_caps: [
				{ name: '+g.oma.sip-im' },
				{ name: '+sip.ice' },
				{ name: 'language', value: '\"en,de\"' }
			]
        };
        
        function onEventsCall(e) {
			console.log("CALL EVENT FIRED: " + e.type);
			
			switch (e.type) {
				case 'm_early_media': {
					$scope.sound.calling.stop();
				}
				
				case 'connecting': {
					setAppState('outgoingCall', 1);
					break;
				}
				
				
				case 'connected': {
					setAppState('incomingCall', 0);
					setAppState('outgoingCall', 0);
					setAppState('call', 1);
					$scope.sound.calling.stop();
					$scope.sound.ringing.stop();
					break;
				}
				
				case 'i_ao_request': {
					$scope.sound.calling.play();
					break;
				}
				
				case 'terminated': {
					$rootScope.callSession = null;
					setAppState('call', 0);
					$scope.sound.calling.stop();
					$scope.sound.ringing.stop();
					break;
				}
			}
	    }
	    		
	}

}());
