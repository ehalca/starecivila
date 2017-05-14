var myApp = angular.module('myApp.controllers', []);

myApp.controller('headerController', ['$scope', '$location', 'configService', function ($scope, $location, configService) {

        var modeName = "";
        updateModeName();
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
        function updateModeName() {
            modeName = ["Avocati", "Test"][configService.getMode()];
            $scope.modeName = modeName;
        }
        $scope.$on('modeChanged', updateModeName);
        $scope.switchMode = function (mode) {
            configService.setMode(mode, true);
            updateModeName();
        };
    }]);