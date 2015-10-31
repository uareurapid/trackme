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

trackme.controller("MapController", function($scope,$http,uiGmapGoogleMapApi) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []

    //$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    $scope.map = {
        center: {
            latitude: 40.1451,
            longitude: -99.6680
        },
        zoom: 4,
        bounds: {}
    };
    $scope.options = {
        scrollwheel: true
    };


    //creates the marker for the record on the map!!!
    var createRecordMarker = function(i, lat,lng, bounds, idKey) {

        if (idKey == null) {
            idKey = "id";
        }

        /*

         //icon as background image
         var newstyle = {
         'background-image':'url("img/markers/'+value[8]+'")',
         'background-size': '36.5px 61px',
         'background-position': 'top left',
         'background-repeat': 'no-repeat'
         }

        on css
         .labelClass {
         padding-top:29px;
         padding-left:2px;
         color:#000;
         font-family: 'open_sansregular';
         height:61px;
         width:37px;
         font-size:9px;
         line-height: 12px;
         }



         */

        var newstyle = {
         'opacity': '0.75'
        }

        var marker = {
            latitude: lat,
            longitude: lng,
            title: 'm' + i,
            options: {
                labelContent : 'Paulo Cristo',
                labelAnchor: "36 61",
                labelClass: 'labelClass',
                labelStyle: newstyle,
                labelInBackground: false
            }

        };
        marker[idKey] = i;
        return marker;
    };

    $scope.randomMarkers = [];
    // Get the bounds from the map once it's loaded
    $scope.$watch(function() {
        return $scope.map.bounds;
    }, function(nv, ov) {
        // Only need to regenerate once
        if (!ov.southwest && nv.southwest) {
            var markers = [];
            console.log("do you see me?");
            /*
            for (var i = 0; i < 50; i++) {

                markers.push(createMarker(i, $scope.map.bounds));
            }was ok */

            $scope.polylines = [];
            // when landing on the page, get all todos and show them
            $http.get('/api/records')
                .success(function(data) {
                    console.log("got the records?: " + JSON.stringify(data));

                    var previous = 0;
                    var current = 0;
                    for(var i=0; i< data.length; i++) {

                        if(i > 0) {
                            previous = i-1;
                        }
                        current = i;

                        var latitude = data[i].latitude;
                        console.log("latitude: " + data[i].latitude);
                        var longitude = data[i].longitude;
                        console.log("longitude: " + data[i].longitude);

                        markers.push(createRecordMarker(i,latitude, longitude, $scope.map.bounds));

                        current = i;


                        if(current!=previous && current > previous) {
                            //run the loop again BAD!!!
                            $scope.polylines  = [
                                {
                                    id: i,
                                    path: [
                                            {
                                                latitude: data[previous].latitude,
                                                longitude: data[previous].longitude
                                            },
                                            {
                                                latitude: data[current].latitude,
                                                longitude: data[current].longitude
                                            }
                                        ],

                                    stroke: {
                                        color: '#6060FB',
                                        weight: 3
                                    },
                                    editable: false,
                                    draggable: false,
                                    geodesic: true,
                                    visible: true,
                                    icons: [{
                                        icon: {
                                            path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                                        },
                                        offset: '25px',
                                        repeat: '50px'
                                    }]
                                }
                            ];

                        }

                    }







                    //$scope.records = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });


            $scope.randomMarkers = markers;
        }
    }, true);


    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps) {

    });
});

//trackme.controller('GreetingController', ['$scope', function($scope,$http) {
//    $scope.greeting2 = 'Hola Paulo!';
//}]);







