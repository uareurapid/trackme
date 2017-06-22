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

var trackme = angular.module('trackme', ['uiGmapgoogle-maps','ngCookies','angular-popover']);

//Define the same constants that we have server side
trackme.value('CONSTANTS',{
                PROTECTED_PATH: "protected",
                PUBLIC_PATH: "opened",//trackables that are public to anyone
                QUERY_STRING: {
                    UNLOCK_CODE: "unlock_code",
                    TRACKABLE_ID: "tid"
                }
            });



//var url = require('url');
//var url_parts = url.parse(req.url, true);
//var query = url_parts.query;


trackme.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBQVDtQOCDfWg4ikGXBvOTB9y03RgLb0M8',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

trackme.controller("MapController", function($scope,$http,uiGmapGoogleMapApi,$interval,$window,$location, CONSTANTS) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []

    //$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };


    //---------------------- PARSE URL PARAMETERS ------------------------------
    var parseUrlParameters = function(paramName) {
        paramName = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + paramName + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };


    //do i have parameters for an unprotected route??
    var tid = parseUrlParameters(CONSTANTS.QUERY_STRING.TRACKABLE_ID);
    var unlock_code = parseUrlParameters(CONSTANTS.QUERY_STRING.UNLOCK_CODE);

    var hasProtectedParams = (tid!==null && unlock_code!==null);
    var hasPublicParams = tid!==null;
    //-------------------------------------------------------------------------

    //will hold the map markers
    $scope.mapMarkers = [];
    //will hold the lines between records
    $scope.polylines = [];

    //filtering applyied to the map
    $scope.trackableFilter = "Show all";
    $scope.deviceFilter = "Show all";

    //a promise to update the map every 1 minute
    $scope.intervalUpdatePromise = undefined;

    $scope.clickedMarker = function(marker, eventName, model, eventArgs) {
        $window.alert(
            'marker position: ' + marker.getPosition().toUrlValue() + '\n' +
            'event name: ' + eventName + '\n' +
            'model id: ' + model.id + '\n' +
            'mouse event position: ' + eventArgs[0].latLng.toUrlValue());
    };

    $scope.showModal = false;

    $scope.toggleModal = function(btnClicked){
        $window.alert("hi there");
        //$scope.buttonClicked = btnClicked;
        $scope.showModal = !$scope.showModal;
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
        };



        var marker = {
            latitude: lat,
            longitude: lng,
            title: 'm' + i,
            label: 'Paulo Cristo',
            show:false,
            name: 'Location: ' + '(' + lat + '),('+  lng + ')',
            cords: {
                latitude: lat,
                longitude: lng
            },
            options: {
                label: 'Paulo Cristo',
                title: 'm' + i
                /*labelContent : 'Paulo Cristo',
                labelAnchor: "36 61",
                labelClass: 'labelClass',
                labelStyle: newstyle,
                labelInBackground: false*/
            }

        };
        marker[idKey] = i;

        return marker;
    };

    $scope.map = {
        center: {
            latitude: 40.1451,
            longitude: -99.6680
        },
        zoom: 4,
        control:{},
        bounds: {}
    };
    $scope.options = {
        scrollwheel: true
    };

    //call this
    $scope.refreshMap = function (newMarkers) {
        //clear previous markers
        $scope.mapMarkers = newMarkers;

        //$scope.mapMarkers.push(createRecordMarker(1,32.779680, -79.935493, $scope.map.bounds));

        console.log("refreshing map....");
        //optional param if you want to refresh you can pass null undefined or false or empty arg
        $scope.map.control.refresh($scope.map.center);//{latitude: 32.779680, longitude: -79.935493}
        $scope.map.control.getGMap().setZoom($scope.map.zoom);
        return;
    };

    //##################### FILTERING CHANGED  -> REBUILD MAP ####################################

    //will force reload of the map every 1 minute
    $scope.updateMapPeriodically = function() {
        console.log("FORCED MAP UPDATE");
        $scope.deviceChanged(null);
    };

    //stop periodic updates
    $scope.stopMapUpdates = function() {
        if (angular.isDefined($scope.intervalUpdatePromise)) {
            $interval.cancel($scope.intervalUpdatePromise);
            $scope.intervalUpdatePromise = undefined;
        }
    };

    if (!angular.isDefined($scope.intervalUpdatePromise)) {
        $scope.intervalUpdatePromise = $interval($scope.updateMapPeriodically,60*1000);
    }


    //########################## ADD MARKERS TO THE MAP ######################
    //add the records on the map, add polylines and markers
    var addPositionsOnMap = function(data) {

        //clear markers
        var markers = [];
        //polylines
        $scope.polylines = [];

        //TODO, this is wrong the line should be always between records of same trackable (even if from different devices?)
        //TODO and the values should be returned in order/date no?? otherwise the lines are not correct
        var previous = 0;
        var current = 0;
        var currentTrackableId = "";
        var previousTrackableId = "";

        for(var i=0; i< data.length; i++) {

            if(i > 0) {
                previous = i-1;
                previousTrackableId = data[previous].trackableId;
            }
            current = i;
            currentTrackableId = data[current].trackableId;

            var latitude = data[i].latitude;
            var longitude = data[i].longitude;
            markers.push(createRecordMarker(i,latitude, longitude, $scope.map.bounds));

            current = i;


            if( (current!=previous && current > previous) && (previousTrackableId===currentTrackableId) ) {
                //run the loop again BAD!!!
                console.log("ADDING A POLYLINE!!!!!");

                var element = {
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
                };

                $scope.polylines.push(element);

            }
        }

        $scope.refreshMap(markers);
    };

    //#######################################################################

    $scope.deviceChanged = function(deviceFilter) {

        var path = "/api/records";

        if(deviceFilter==null) {
            deviceFilter = "Show all";
        }
        else {
            path = path + "?device_id=" + deviceFilter;
        }

        $scope.deviceFilter = deviceFilter;
        console.log("device changed to: " + deviceFilter);

        //clear markers
        var markers = [];
        $http.get(path)
            .success(function(data) {
                $scope.records = data;
                console.log("received" + JSON.stringify(data));

                addPositionsOnMap(data);

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

    };


    $scope.trackableChanged = function(trackableFilter) {

        var path = "/api/records";

        if(trackableFilter==null) {
            trackableFilter = "Show all";
        }
        else {
            path = path + "?trackable_id=" + trackableFilter;
        }
        $scope.trackableFilter = trackableFilter;
        console.log("trackable changed to: " + trackableFilter);

        //clear markers
        var markers = [];
        $http.get(path)
            .success(function(data) {
                $scope.records = data;
                console.log("received" + JSON.stringify(data));

                addPositionsOnMap(data);

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

    };

    //###################################################################################

    // ON EXIT STUFF

    $window.onbeforeunload =  $scope.onExit;
    $scope.onExit = function() {
        $scope.stopMapUpdates();
        console.log("exiting");
        return ('bye bye');
    };

    //############################################

    //TODO make sure we have values on everything!!!!! makes the map unresponsive

    
    // Get the bounds from the map once it's loaded
    $scope.$watch(function() {
        return $scope.map.bounds;
    }, function(nv, ov) {

        //TODO check: localhost:8080/protected?tid=582cd8ba7f5c845943765a46&unlock_code=ffd34d9d-5b42-494f-83a8-19b536d1bfb9

        var apiRoute = null;

        if(hasProtectedParams) {
            //unprotected route, relies on params (tid && unlock_code mandatory)
            apiRoute = '/trackable_records?tid='+tid+"&unlock_code="+unlock_code;
        }
        else if(hasPublicParams) {
            //just tid is mandatory
            apiRoute = '/trackable_records?tid='+tid;
        }
        else {
            //normal protected route
            apiRoute = '/api/records';
        }

        // Only need to regenerate once
        if (!ov.southwest && nv.southwest) {
            var markers = [];

            $scope.polylines = [];
            // when landing on the page, get all todos and show them
            $http.get(apiRoute)
                .success(function(data) {
                    console.log("records: " + JSON.stringify(data));


                    //add the records on the map, add polylines and markers
                    addPositionsOnMap(data);



                    //$scope.records = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });


            $scope.mapMarkers = markers;
        }
    }, true);


    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps) {

    });
});

trackme.controller('infoWindowCtrl', function($scope) {
    $scope.glyphClick = function() {
        console.log('Button clicked!');
    }
});

//a directive to add in the html template
trackme.directive('modal', function () {
    return {
        template: '<div class="modal fade">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '<h4 class="modal-title">clicked!!</h4>' +
        '</div>' +
        '<div class="modal-body" ng-transclude></div>' +
        '</div>' +
        '</div>' +
        '</div>',
        restrict: 'E',
        transclude: true,
        replace:true,
        scope:true,
        link: function postLink(scope, element, attrs) {
            scope.$watch(attrs.visible, function(value){
                if(value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = true;
                });
            });

            $(element).on('hidden.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});



//trackme.controller('GreetingController', ['$scope', function($scope,$http) {
//    $scope.greeting2 = 'Hola Paulo!';
//}]);







