var myApp = angular.module('myApp.controllers', []);

myApp.controller('headerController', ['$scope', '$location', 'configService', function ($scope, $location, configService) {
        
        var modeName = "";
        updateModeName();
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
        function updateModeName(){
            modeName = ["Avocati", "Simple"][configService.getMode()];
            $scope.modeName = modeName;
        }
        $scope.switchMode = function(mode){
            configService.setMode(mode);
            updateModeName();
        };
    }]);