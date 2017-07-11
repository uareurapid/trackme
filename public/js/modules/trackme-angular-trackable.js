/**
 * Created by paulocristo on 31/10/15.
 */

//trackables controller
var trackme = angular.module('trackme').controller('TrackablesController',function ($scope, $cookies, $http) {

    $scope.testGetProfile = function() {
        $scope.$emit("GetUserProfile", {});
    };

    console.log("trying it now....");
    $scope.testGetProfile();

    //store the main object on the scope
    $scope.formTrackablesData = {};

    //default privacy level
    $scope.formTrackablesData.privacy = "Private"

    $scope.formTrackablesData.showPrivacy = false;

    $scope.formTrackablesData.typeOptions = ['Person','Object', 'Animal'];

    $scope.privacyChanged = function() {
        console.log("privacy changed to: " + $scope.formTrackablesData.privacy);
    };

    $scope.selectedTrackable = "Show all";
    //actually the trackbale object
    $scope.trackable = undefined;

    //############ GET THE TRACKABLE OWNER #####################################
    $scope.getTrackableOwner = function(successCallback, errorCallback) {

        //actually gets the logged in username
        $http.get('/profile/user')
            .success(function (data) {
                console.log("trackable owner: " + data.username);
                //assign the username to the scope var
                $scope.formTrackablesData.owner = data.username;
                successCallback(data.username);

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });

    };

    //TODO FOR FORM VALIDATION HOWTO CHECK:
    //https://scotch.io/tutorials/angularjs-form-validation

    $scope.canShowDetails = function(selection) {
        $scope.selectedTrackable = selection;
        return $scope.selectedTrackable !== "Show all";
    };

    $scope.showTrackableDetails = function() {


        String.prototype.replaceAll = String.prototype.replaceAll || function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        var apiPath = "/api/trackables/" + JSON.stringify($scope.selectedTrackable).replaceAll("\"","");
        $http.get(apiPath)
            .success(function(trackable) {

                //the API resturns an array of 1
                if(trackable.length>0) {

                    $scope.trackable = trackable[0];

                    var privacy = trackable[0].privacy;

                    var calloutMgr = hopscotch.getCalloutManager();
                    calloutMgr.createCallout({
                        id: 'attach-icon',
                        title: "Trackable details!",
                        content: "<hr/><p><strong>Name:</strong> " + trackable[0].name +"</p>" +
                        "<p><strong>Description:</strong> " + trackable[0].description +"</p>" +
                        "<p><strong>Privacy: </strong>" + privacy + "</p>" +
                        ( (privacy==='Protected' || privacy==='Public' ) ? "<input type='button' onclick='shareTrackable()' value='Share this trackable'>" : ""),
                        target: "filter_by_trackable",
                        placement: "right",
                        showCloseButton: true
                    });
                }


            })
            .error(function(data) {
                console.log('Error: ' + data);
            });


    };

    window.shareTrackable = function() {
        console.log("selected:" + $scope.selectedTrackable);
        //I can only share after i see the details window
        if($scope.trackable) {

            //gets the correct API url considering the trackable privacy
            var getAPIURL = function(isProtected, unlockCode,id) {
              if(isProtected && unlockCode) {
                return  "/protected?tid=" + id + "&unlock_code=" + unlockCode;
              }
                return "/public?tid=" + id;
            };

            var isProtected = ($scope.trackable.privacy === 'Protected');

            var uri = "mailto:?subject=";
            uri += encodeURIComponent("check this trackable");
            uri += "&body=";
            uri += encodeURIComponent("Check it here: " + document.location.origin + getAPIURL(isProtected,$scope.trackable.unlockCode,$scope.trackable._id));

            //$scope.trackable._id + () ? "&unlock_code=" + $scope.trackable.unlockCode : "");

            location.href=uri;
        }

    };

    //######## GET ALL TRACKABLES ###############
    $scope.getAllTrackables = function() {

        console.log("getting all available trackables for username: " + $scope.formTrackablesData.owner);

        var apiPath = '/api/trackables?owner=' + $scope.formTrackablesData.owner;
        $http.get(apiPath)
            .success(function(data) {

                //reset all input fields, so we can add a new one again
                $scope.formTrackablesData.privacy = "Private";
                $scope.formTrackablesData.name = "";
                $scope.formTrackablesData.description = "";
                $scope.formTrackablesData.type = $scope.formTrackablesData.typeOptions[0];
                //do not clear $scope.formTrackablesData.owner

                //add new received data to the $scope var
                $scope.trackables = data;
                console.log("received: " +data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // when landing on the page, get the username, all his trackables, and then we show them!
    $scope.getTrackableOwner($scope.getAllTrackables);

    //############## CREATE NEW TRACKABLE ######################
    //this is actually the submit of the form
    //called from ui to create a new trackable object
    $scope.createTrackable = function() {

        //first thing is get the username
        //i do not need to check the username again, since the value is available since first landed on the page

        //now send the trackable data
        console.log("sending new trackable request now...");
        $http.post('/api/trackables', $scope.formTrackablesData)
            .success(function(data) {
                //get them all again and clear the form fields
                $scope.getAllTrackables();
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

    // delete a trackable after checking it
    $scope.removeAllTrackables = function() {

        $scope.getTrackableOwner(function(username) {
            //success

                $http.delete('/api/trackables/delete/all/' + username)
                    .success(function(data) {
                        console.log("received " + JSON.stringify(data));
                    })
                    .error(function(error) {
                        console.log("received error" + JSON.stringify(error));
                    });


        },
        function() {
            //error callback

        }
        );

    };

});