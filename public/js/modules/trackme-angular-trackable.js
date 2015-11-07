/**
 * Created by paulocristo on 31/10/15.
 */

//trackables controller
var trackme = angular.module('trackme').controller('TrackablesController',function ($scope, $http) {


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


    $scope.getTrackableOwner = function(successCallback, errorCallback) {

        console.log("getting trackable owner...");
        $http.get('/profile/user')
            .success(function (data) {
                console.log("trackable owner: " + data.username);
                //assign the username to the scope var
                $scope.formTrackablesData.owner = data.username;
                successCallback();

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    //FORM VALIDATION HOWTO
    //https://scotch.io/tutorials/angularjs-form-validation

    $scope.selectedTrackable = "Show all";
    // when landing on the page, get all trackables and show them
    $http.get('/api/trackables')
        .success(function(data) {
            $scope.trackables = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    //this is actually the submit of the form
    $scope.createNewUserTrackable = function() {

        //now send the trackable data
        console.log("sending new trackable request now...");
        $http.post('/api/trackables', $scope.formTrackablesData)
            .success(function(data) {
                $scope.formTrackablesData = {}; // clear the form so our user is ready to enter another
                $scope.trackables = data;
                console.log("received: " +data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };


    //called from ui to create a new trackable object
    $scope.createTrackable = function() {

        //first thing is get the username
        $scope.getTrackableOwner($scope.createNewUserTrackable);

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