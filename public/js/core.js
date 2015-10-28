/**
 * Created by paulocristo on 25/10/15.
 * - public            <!-- holds all our files for our frontend angular application -->
 ----- core.js       <!-- all angular code for our app -->
 ----- index.html    <!-- main view -->
 - package.json      <!-- npm configuration to install dependencies/modules -->
 - server.js         <!-- Node configuration -->

 https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular
 */

var trackme = angular.module('trackme', []);

trackme.controller('GreetingController', ['$scope', function($scope) {
    $scope.greeting2 = 'Hola Paulo!';
}]);

function profileController($scope, $http) {
    $scope.username = {};
    $scope.greeting = 'Welcome ' + $scope.username +'!';
    $http.get('/profile/user')
        .success(function (data) {
            $scope.username = data;
            console.log(data);
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });
}
//http://stackoverflow.com/questions/21505157/session-username-not-showing-inside-angularjs-ngview-template-but-does-outside-o

/*function getCurrentUser(Users, $scope) {
    Users.get()
        .success(function (username) {
            $scope.username = username.user;
        });
}*/


function mainController($scope, $http) {
 $scope.formData = {};

 // when landing on the page, get all todos and show them
 $http.get('/api/devices')
     .success(function(data) {
      $scope.devices = data;
      console.log(data);
     })
     .error(function(data) {
      console.log('Error: ' + data);
     });

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

}
