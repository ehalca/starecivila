'use strict';
angular.module('myApp.view1', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/view1', {
                    templateUrl: 'view1/view1.html',
                    controller: 'MainController'
                });
            }])

        .controller('MainController', ['eventPageService', 'dataService', 'configService', '$scope', function (eventPageService, dataService, configService, $scope) {
                var data;
                var mapping;
                var mode;
                function init() {
                    console.log('init called');
                    function localInit() {
                        data = dataService.getData();
                        mapping = dataService.getMapping();
                        mode = configService.getMode();
                        eventPageService.pushMode(mode, false);
                        eventPageService.pushMapping(mapping, false);
                        if (data) {
                            eventPageService.pushData(data, false);
                        }
                        render();
                    }
                    if (eventPageService.isConnected()) {
                        console.log('init isConnected');
                        eventPageService.getBackGroundData().then(function (r) {
                            console.log('init data Return ');
                            data = ReservationData.fromMessage(r.data);
                            mapping = ReservationMapping.fromMessage(r.data.mapping);
                            mode = r.mode;
                            console.log('init calling render');
                            render();
                        }, function () {
                            localInit();
                        });
                    } else {
                        localInit();
                    }
                }
                ;
                init();
                $scope.loading = function () {
                    return mapping && data;
                }
                function render() {
                    $scope.headers = [];
                    $scope.reservationInfo = [];
                    if (data && data.mapping) {
                        for (var key in data.mapping.getDisplayMapping()) {
                            $scope.headers.push(data.mapping.getDisplayMapping()[key]);
                        }
                        $scope.reservationInfo = data.reservations.map((r) => {
                            return Object.keys(data.mapping.getDisplayMapping()).map((k)=>{
                                return r.data[k];
                            });
                        });

                    }
                }
                $scope.isConnected = eventPageService.isConnected();
            }]);