/**
 * Created by paulocristo on 25/10/15.
 * - public            <!-- holds all our files for our frontend angular application -->
 ----- core.js       <!-- all angular code for our app -->
 ----- index.html    <!-- main view -->
 - package.json      <!-- npm configuration to install dependencies/modules -->
 - server.js         <!-- Node configuration -->

 https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular
 */

//var modalModule = angular.module('modalModule', ['ui.bootstrap']);

// A module in AngularJS is a place where you can collect and organize
// components like controllers, services, directives, and filters

var trackme = angular.module('trackme', ['uiGmapgoogle-maps']);

trackme.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBQVDtQOCDfWg4ikGXBvOTB9y03RgLb0M8',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

trackme.controller("MapController", function($scope, uiGmapGoogleMapApi) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []

    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps) {

    });
});

trackme.controller('GreetingController', ['$scope', function($scope,$http) {
    $scope.greeting2 = 'Hola Paulo!';
}]);

//get the records on main page to load into the map
trackme.controller('RecordsController', function($scope,$http) {
    $scope.formData = {};

    // when landing on the page, get all todos and show them
    $http.get('/api/records')
        .success(function(data) {
            $scope.records = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

});

trackme.controller('ProfileController',function ($scope, $http) {
    $scope.userinfo = {};
    $scope.greeting = {};
    $http.get('/profile/user')
        .success(function (data) {
            $scope.userinfo = data;
            $scope.greeting = 'Welcome ' + $scope.userinfo.username +'!'
            console.log(data);
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });
});


trackme.controller('DevicesController',function ($scope, $http) {

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

});

// Trackables
trackme.controller('TrackablesController',function ($scope, $http) {

    $scope.formData = {};


    // when landing on the page, get all trackables and show them
    $http.get('/api/trackables')
        .success(function(data) {
            $scope.trackables = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTrackable = function() {

        $http.post('/api/trackables', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.trackables = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a trackable after checking it
    $scope.deleteTrackable = function(id) {

        $http.delete('/api/trackables/' + id)
            .success(function(data) {
                $scope.trackables = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

});
