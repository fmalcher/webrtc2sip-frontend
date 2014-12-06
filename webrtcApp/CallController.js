(function(){
	'use strict';

	angular
		.module('webrtcApp')
		.controller('CallController', CallController);
	
	CallController.$inject = ['$scope', '$rootScope', 'scopeService'];
	
	function CallController($scope, $rootScope, scopeService) {		
		$scope.stack = null;
		$scope.alert = null;
		
		
		$scope.state = {
			initialized: 0,
			registering: 0,
			registered: 0
		};

		
		$scope.createSipStack = createSipStack;
		$scope.sipUnregister = sipUnregister;
		
		var onEventsStack;
		var onEventsSession;
		var registerSession;
		var callSession;
		
		$scope.registerSession = registerSession;

		
		///////////////////
		
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
			if(registerSession) {
				registerSession.unregister();
			}else{
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
                            expires: 200,
                            events_listener: { events: '*', listener: onEventsRegister },
                            sip_caps: [
                                { name: '+g.oma.sip-im', value: null },
                                { name: '+audio', value: null },
                                { name: 'language', value: '\"en,de\"' }
                            ]
                        });
                        registerSession.register();
                    }
                    catch (e) {
                        $scope.alert = "<b>1:" + e + "</b>";
                    }
                    break;
	            }
	            
	            case 'stopped': {
		            setState('registered', 0);
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
	
	            /*case 'i_new_call': {
                    if (oSipSessionCall) {
                        // do not accept the incoming call if we're already 'in call'
                        e.newSession.hangup(); // comment this line for multi-line support
                    }
                    else {
                        oSipSessionCall = e.newSession;
                        // start listening for events
                        oSipSessionCall.setConfiguration(oConfigCall);

                        uiBtnCallSetText('Answer');
                        btnHangUp.value = 'Reject';
                        btnCall.disabled = false;
                        btnHangUp.disabled = false;

                        startRingTone();

                        var sRemoteNumber = (oSipSessionCall.getRemoteFriendlyName() || 'unknown');
                        txtCallStatus.innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";
                        showNotifICall(sRemoteNumber);
                    }
                    break;
                }
	
	            case 'm_permission_requested': {
	            	divGlassPanel.style.visibility = 'visible';
					break;
				}
				
	            case 'm_permission_accepted': case 'm_permission_refused': {
                    divGlassPanel.style.visibility = 'hidden';
                    if(e.type == 'm_permission_refused'){
                        uiCallTerminated('Media stream permission denied');
                    }
                    break;
                }*/
	
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
	
	
	
	    // Callback function for SIP sessions (INVITE, REGISTER, MESSAGE...)
	    function onEventsSession(e /* SIPml.Session.Event */) {
			console.log("SESSION EVENT FIRED: " + e.type);
			
	        switch (e.type) {
				case 'connected': {
					
				}
			}
				/*
				case 'terminating': case 'terminated':
	                {
	                    if (e.session == oSipSessionRegister) {
	                        uiOnConnectionEvent(false, false);
	
	                        oSipSessionCall = null;
	                        oSipSessionRegister = null;
	
	                        txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
	                    }
	                    else if (e.session == oSipSessionCall) {
	                        uiCallTerminated(e.description);
	                    }
	                    break;
	                } // 'terminating' | 'terminated'
	
	            case 'm_stream_video_local_added':
	                {
	                    if (e.session == oSipSessionCall) {
	                        uiVideoDisplayEvent(true, true);
	                    }
	                    break;
	                }
	            case 'm_stream_video_local_removed':
	                {
	                    if (e.session == oSipSessionCall) {
	                        uiVideoDisplayEvent(true, false);
	                    }
	                    break;
	                }
	            case 'm_stream_video_remote_added':
	                {
	                    if (e.session == oSipSessionCall) {
	                        uiVideoDisplayEvent(false, true);
	                    }
	                    break;
	                }
	            case 'm_stream_video_remote_removed':
	                {
	                    if (e.session == oSipSessionCall) {
	                        uiVideoDisplayEvent(false, false);
	                    }
	                    break;
	                }
	
	            case 'm_stream_audio_local_added':
	            case 'm_stream_audio_local_removed':
	            case 'm_stream_audio_remote_added':
	            case 'm_stream_audio_remote_removed':
	                {
	                    break;
	                }
	
	            case 'i_ect_new_call':
	                {
	                    oSipSessionTransferCall = e.session;
	                    break;
	                }
	
	            case 'i_ao_request':
	                {
	                    if(e.session == oSipSessionCall){
	                        var iSipResponseCode = e.getSipResponseCode();
	                        if (iSipResponseCode == 180 || iSipResponseCode == 183) {
	                            startRingbackTone();
	                            txtCallStatus.innerHTML = '<i>Remote ringing...</i>';
	                        }
	                    }
	                    break;
	                }
	
	            case 'm_early_media':
	                {
	                    if(e.session == oSipSessionCall){
	                        stopRingbackTone();
	                        stopRingTone();
	                        txtCallStatus.innerHTML = '<i>Early media started</i>';
	                    }
	                    break;
	                }
	
	            case 'm_local_hold_ok':
	                {
	                    if(e.session == oSipSessionCall){
	                        if (oSipSessionCall.bTransfering) {
	                            oSipSessionCall.bTransfering = false;
	                            // this.AVSession.TransferCall(this.transferUri);
	                        }
	                        btnHoldResume.value = 'Resume';
	                        btnHoldResume.disabled = false;
	                        txtCallStatus.innerHTML = '<i>Call placed on hold</i>';
	                        oSipSessionCall.bHeld = true;
	                    }
	                    break;
	                }
	            case 'm_local_hold_nok':
	                {
	                    if(e.session == oSipSessionCall){
	                        oSipSessionCall.bTransfering = false;
	                        btnHoldResume.value = 'Hold';
	                        btnHoldResume.disabled = false;
	                        txtCallStatus.innerHTML = '<i>Failed to place remote party on hold</i>';
	                    }
	                    break;
	                }
	            case 'm_local_resume_ok':
	                {
	                    if(e.session == oSipSessionCall){
	                        oSipSessionCall.bTransfering = false;
	                        btnHoldResume.value = 'Hold';
	                        btnHoldResume.disabled = false;
	                        txtCallStatus.innerHTML = '<i>Call taken off hold</i>';
	                        oSipSessionCall.bHeld = false;
	
	                        if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
	                            uiVideoDisplayEvent(true, true);
	                            uiVideoDisplayEvent(false, true);
	                        }
	                    }
	                    break;
	                }
	            case 'm_local_resume_nok':
	                {
	                    if(e.session == oSipSessionCall){
	                        oSipSessionCall.bTransfering = false;
	                        btnHoldResume.disabled = false;
	                        txtCallStatus.innerHTML = '<i>Failed to unhold call</i>';
	                    }
	                    break;
	                }
	            case 'm_remote_hold':
	                {
	                    if(e.session == oSipSessionCall){
	                        txtCallStatus.innerHTML = '<i>Placed on hold by remote party</i>';
	                    }
	                    break;
	                }
	            case 'm_remote_resume':
	                {
	                    if(e.session == oSipSessionCall){
	                        txtCallStatus.innerHTML = '<i>Taken off hold by remote party</i>';
	                    }
	                    break;
	                }
	
	            case 'o_ect_trying':
	                {
	                    if(e.session == oSipSessionCall){
	                        txtCallStatus.innerHTML = '<i>Call transfer in progress...</i>';
	                    }
	                    break;
	                }
	            case 'o_ect_accepted':
	                {
	                    if(e.session == oSipSessionCall){
	                        txtCallStatus.innerHTML = '<i>Call transfer accepted</i>';
	                    }
	                    break;
	                }
	            case 'o_ect_completed':
	            case 'i_ect_completed':
	                {
	                    if(e.session == oSipSessionCall){
	                        txtCallStatus.innerHTML = '<i>Call transfer completed</i>';
	                        btnTransfer.disabled = false;
	                        if (oSipSessionTransferCall) {
	                            oSipSessionCall = oSipSessionTransferCall;
	                        }
	                        oSipSessionTransferCall = null;
	                    }
	                    break;
	                }
	            case 'o_ect_failed':
	            case 'i_ect_failed':
	                {
	                    if(e.session == oSipSessionCall){
	                        txtCallStatus.innerHTML = '<i>Call transfer failed</i>';
	                        btnTransfer.disabled = false;
	                    }
	                    break;
	                }
	            case 'o_ect_notify':
	            case 'i_ect_notify':
	                {
	                    if(e.session == oSipSessionCall){
	                        txtCallStatus.innerHTML = "<i>Call Transfer: <b>" + e.getSipResponseCode() + " " + e.description + "</b></i>";
	                        if (e.getSipResponseCode() >= 300) {
	                            if (oSipSessionCall.bHeld) {
	                                oSipSessionCall.resume();
	                            }
	                            btnTransfer.disabled = false;
	                        }
	                    }
	                    break;
	                }
	            case 'i_ect_requested':
	                {
	                    if(e.session == oSipSessionCall){                        
	                        var s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?";//FIXME
	                        if (confirm(s_message)) {
	                            txtCallStatus.innerHTML = "<i>Call transfer in progress...</i>";
	                            oSipSessionCall.acceptTransfer();
	                            break;
	                        }
	                        oSipSessionCall.rejectTransfer();
	                    }
	                    break;
	                }
	        }*/
	    }
	    
	    
	    function setState(key, val){
		    scopeService.safeApply($rootScope, function(){
			    $scope.state[key] = val;
		    });
		    return;
	    }
		
		
	}

}());
