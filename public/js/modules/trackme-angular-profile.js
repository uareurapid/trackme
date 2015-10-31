/**
 * Created by paulocristo on 31/10/15.
 */

var trackme = angular.module('trackme').controller('ProfileController',function ($scope, $http) {
    $scope.userinfo = {};
    $scope.greeting = {};
    $http.get('/profile/user')
        .success(function (data) {
            $scope.userinfo = data;
            $scope.greeting = 'Welcome ' + $scope.userinfo.username +'!';
            console.log(data);
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });
});