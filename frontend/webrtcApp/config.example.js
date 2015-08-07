var config = {};

config.backend = '/api';


config.websocket_proxy_url = 'ws://{W2SIP}:{W2SPORT}';
config.outbound_proxy_url = '';
config.ice_servers = [];
config.defaultCalleeNumber = '08003303762';



angular.module('webrtcApp').constant('appConfig', config);
