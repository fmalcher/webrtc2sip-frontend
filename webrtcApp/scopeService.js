angular
	.module('webrtcApp')
	.service('scopeService', function() {
		return {
			safeApply: function ($scope, fn) {
				var phase = $scope.$root.$$phase;
				if (phase == '$apply' || phase == '$digest') {
					if (fn && typeof fn === 'function') {
						fn();
					}
				} else {
					$scope.$apply(fn);
				}
			},
		};
	});