'use strict';

angular.module('myApp.view2', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/view2', {
                    templateUrl: 'view2/view2.html',
                    controller: 'View2Ctrl'
                });
            }])

        .controller('View2Ctrl', ['$scope','dataService','$location', function ($scope, dataService, location) {
                $scope.readFile = function () {
                    // define reader
                    var reader = new FileReader();

                    // A handler for the load event (just defining it, not executing it right now)
                    reader.onload = function (e) {
                        $scope.$apply(function () {
                            dataService.setData(reader.result);
                           // location.path('/view1');
                        });
                    };

                    // get <input> element and the selected file 
                    var csvFileInput = document.getElementById('fileInput');
                    var csvFile = csvFileInput.files[0];

                    // use reader to read the selected file
                    // when read operation is successfully finished the load event is triggered
                    // and handled by our reader.onload function
                    reader.readAsText(csvFile);
                };
            }]);