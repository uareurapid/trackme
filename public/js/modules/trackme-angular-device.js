/**
 * Created by paulocristo on 30/10/15.
 */

//device module
var trackme = angular.module('trackme').controller('DevicesController',function ($scope, $http) {

    $scope.formData = {};

    //all these stuff should be on the services, not on the controllers,
    //$http and $resource on services, $scope on controllers
    //like: https://scotch.io/tutorials/setting-up-a-mean-stack-single-page-application
    //http://kirkbushell.me/when-to-use-directives-controllers-or-services-in-angular/

    $scope.selectedDevice = "Show all";
    // when landing on the page, get all todos and show them
    $http.get('/api/devices')
        .success(function(data) {
            $scope.devices = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    /*$scope.deviceChanged = function() {
      console.log("device changed to: " + $scope.selectedDevice);
    };*/

    // when submitting the add form, send the text to the node API
    $scope.createDevice = function() {

        $http.post('/api/devices', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.devices = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a device after checking it
    $scope.deleteDevice = function(id) {

        $http.delete('/api/devices/' + id)
            .success(function(data) {
                $scope.devices = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

});