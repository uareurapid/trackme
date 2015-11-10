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

    $scope.getDeviceOwner = function(successCallback, errorCallback) {

        console.log("getting device owner...");
        $http.get('/profile/user')
            .success(function (data) {
                console.log("device owner: " + data.username);
                //assign the username to the scope var
                $scope.formData.owner = data.username;
                successCallback();

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    $scope.selectedDevice = "Show all";

    //get all user devices
    $scope.getUserDevices = function() {

        $http.get('/api/devices')
            .success(function(data) {
                $scope.devices = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // when landing on the page, get all todos and show them
    $http.get('/api/devices')
        .success(function(data) {
            $scope.devices = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });


    //this is actually the submit of the form
    $scope.createNewUserDevice = function() {

        console.log("submitting the form to add a new device for user: " + $scope.formData.owner);

        //now submit the form and create the device
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

    //called from ui, to add a new device
    $scope.createDevice = function() {

        //pass a success and failure callback (optional)
        $scope.getDeviceOwner($scope.createNewUserDevice);

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