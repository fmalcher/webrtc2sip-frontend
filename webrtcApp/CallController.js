(function(){
	'use strict';

	angular
		.module('webrtcApp')
		.controller('CallController', CallController);
	
	CallController.$inject = ['$scope', '$rootScope', 'scopeService'];
	
	function CallController($scope, $rootScope, scopeService) {		
		$scope.stack = null;
		$scope.alert = null;
		
		$scope.SIPcred = SIPcred;
		$scope.curSIPcred = $scope.SIPcred[0];
		
		
		
		$scope.state = {
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
		
		$scope.setCred = setCred;
		$scope.createSipStack = createSipStack;
		$scope.sipUnregister = sipUnregister;
		$scope.sipCall = sipCall;
		$scope.sipCallAnswer = sipCallAnswer;
		$scope.sipHangup = sipHangup;
		$scope.sipTransfer = sipTransfer;
		$scope.sipHold = sipHold;
		$scope.sipResume = sipResume;
		
		$scope.callOptions = {
			calleeNumber: "03413062286",
			enableOIR: false
		};
		
		var onEventsStack;
		var onEventsCall;
		var onEventsRegister;
		
		var registerSession;
		var callSession;
		
		$scope.registerSession = registerSession;

		
		///////////////////
		
		function setCred(index){
			if(!$scope.SIPcred[index]) return false;

			$scope.curSIPcred = $scope.SIPcred[index];
			sipUnregister();
			//createSipStack();
		}
	
		
		
		
		init();

		
		
		function init(){
			var readyCallback = function(e){
				setState('initialized', 1);
			};
			var errorCallback = function(e){
				console.error('Failed to initialize the engine: ' + e.message);
			}
			
			SIPml.init(readyCallback, errorCallback);

		}
		
		
		function sipUnregister(){
			if(!$scope.stack) return false;
			
			setState('unregistering', 1);
			
			if(registerSession) {
				registerSession.unregister();
			}else{
				$scope.stack.stop();
			}
		}
		
		
		function createSipStack(){
			
			var cred = $scope.curSIPcred;
			
			$scope.stack = new SIPml.Stack({
				realm: cred.realm,
				impi: cred.impi,
				impu: cred.impu,
				password: cred.password,
				display_name: '',
				websocket_proxy_url: SIPcredGlobal.websocket_proxy_url,
				outbound_proxy_url: SIPcredGlobal.outbound_proxy_url,
				ice_servers: SIPcredGlobal.ice_servers, 
				enable_rtcweb_breaker: true,
				events_listener: { events: '*', listener: onEventsStack },
				sip_headers: [
					{ name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0' },
					{ name: 'Organization', value: 'HfTL' }
				]
			});
			
			$scope.stack.start();
			
		}
		
		
		
		//Callback function for SIP Stacks
	    function onEventsStack(e) {
	        console.log("STACK EVENT FIRED: " + e.type);
	        
	        switch (e.type) {
	            
	            case 'started': {

                    // catch exception for IE (DOM not ready)
                    try {
                        // LogIn (REGISTER) as soon as the stack finish starting
                        registerSession = $scope.stack.newSession('register', {
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
		            setState('registered', 0);
		            setState('registering', 0);
		            setState('unregistering', 0);
		            setState('call', 0);
		            setState('incomingCall', 0);
		            setState('outgoingCall', 0);
		            setState('hold', 0);
		            setState('held', 0);
		            setState('resume', 0);
		            break;
	            }
	            
	            
	            case 'stopping': case 'failed_to_start': case 'failed_to_stop': {
                    var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
                    
                    $scope.stack = null;
                    registerSession = null;
                    callSession = null;

                    //uiOnConnectionEvent(false, false);

                    //stopRingbackTone();
                    //stopRingTone();

                    //uiVideoDisplayShowHide(false);
                    //divCallOptions.style.opacity = 0;

                    //txtCallStatus.innerHTML = '';
                    //txtRegStatus.innerHTML = bFailure ? "<i>Disconnected: <b>" + e.description + "</b></i>" : "<i>Disconnected</i>";
                    break;
                }
	
	            case 'i_new_call': {
                    if(callSession) { //do not accept incoming call if there's another active callSession
                        e.newSession.hangup();
                    } else {
                        callSession = e.newSession;
                        callSession.setConfiguration(callConfig);

                        var sRemoteNumber = (callSession.getRemoteFriendlyName() || 'unknown');
                        
                        console.log("INCOMING CALL: " + sRemoteNumber);
                        
                        setState('incomingCall', 1);
                        
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
	               	setState('registering', 1);
					break;
				}
				
				case 'connected': {
	               	setState('registering', 0);
	               	setState('registered', 1);
					break;
				}
				
				case 'terminated': {
					$scope.stack.stop();
				}
			}
		}
	
	
	
	    function onEventsCall(e /* SIPml.Session.Event */) {
			console.log("CALL EVENT FIRED: " + e.type);
			
			switch (e.type) {
				case 'connected': {
					setState('incomingCall', 0);
					setState('call', 1);
					break;
				}
				
				case 'terminated': {
					callSession = null;
					setState('call', 0);
					break;
				}
			}
			
	    }
	    
	    
	    
	    // makes a call (SIP INVITE)
	    function sipCall() {
	        if ($scope.stack && !callSession) {

	            // create call session
	            var thisCallConfig = callConfig;
	            
	            //OIR is enabled, hide my number
	            if($scope.callOptions.enableOIR){
		            
		            thisCallConfig.sip_headers = [
						{ name: 'P-Preferred-Identity', value: '<' + SIPcred.impu + '>', session: false },
						{ name: 'Privacy', value: 'header', session: false }
					];
		            
				}else{
					thisCallConfig.sip_headers = [];
				}
	            
	            callSession = $scope.stack.newSession('call-audio', thisCallConfig);
	            // make call
	            if (callSession.call($scope.callOptions.calleeNumber) != 0) {
	                callSession = null;
	                $scope.alert = "Error...";

	                return;
	            }
	        }
	    }
	    
	    
	    
	    
	    function sipCallAnswer() {
		    if(callSession) {
	            callSession.accept(callConfig);
	        }
	        return;
	    }
	    
	    
	    
	    function sipHangup() {
		    if(callSession) {
			    callSession.hangup();
		    }
	    }
	    
	    
	    function sipHold() {
		    if(callSession) {
			    callSession.hold();
			    setState("hold", 1);
		    }
	    }
	    
	    function sipResume() {
		    if(callSession) {
			    callSession.resume();
			    setState("hold", 0);
		    }
	    }
	    
	    


		function sipTransfer() {
	        if(callSession) {
	            var destNumber = prompt('Enter destination number', '');
	            console.log("Now initiating transfer to " + destNumber);
	            if(destNumber) {
		            
	                if(callSession.transfer(destNumber) != 0) {
						$scope.alert = "Call forwarding failed..."
	                    return;
	                }
	            }
	        }
	    }

	    
	    
	    
	    function setState(key, val){
		    scopeService.safeApply($rootScope, function(){
			    $scope.state[key] = val;
		    });
		    return;
	    }
	    
	    
	    
		var audioRemote = document.getElementById('audio_remote');
		var callConfig = {
            audio_remote: audioRemote,
			bandwidth: { audio:undefined, video:undefined },
            events_listener: { events: '*', listener: onEventsCall },
            sip_caps: [
				{ name: '+g.oma.sip-im' },
				{ name: '+sip.ice' },
				{ name: 'language', value: '\"en,de\"' }
			]
        };
		
		
	}

}());
