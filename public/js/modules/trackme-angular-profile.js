/**
 * Created by paulocristo on 31/10/15.
 */

var trackme = angular.module('trackme');

trackme.controller('ProfileController',function ($scope, $http) {

    $scope.userinfo = {};
    $scope.greeting = {};
    $http.get('/profile/user')
        .success(function (data) {
            //TODO start the tour only if is the first login
            // Start the tour!
            hopscotch.startTour(window.tour);

            $scope.userinfo = data;
            $scope.greeting = 'Welcome ' + $scope.userinfo.username +'!';
            console.log(data);
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });

    $scope.getLoggedInUser = function() {
        // task
        console.log("getLoggedInUser called...");
    };

    //use the service broadcats approach to use functions of one controller into another one
    $scope.$on("GetUserProfile", function(){
        console.log("broadcast event:::");
        $scope.getLoggedInUser();
    });


});