/**
 * Created by paulocristo on 31/10/15.
 */

//trackables controller
var trackme = angular.module('trackme').controller('TrackablesController',function ($scope, $http) {

    $scope.formTrackablesData = {};
    $scope.formTrackablesData.type = {
        availableOptions: [
            {id: '1', name: 'Person'},
            {id: '2', name: 'Object'},
            {id: '3', name: 'Animal'}
        ],
        selectedOption: {id: '1', name: 'Person'} //This sets the default value of the select in the ui
    };


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

        $http.post('/api/trackables', $scope.formTrackablesData)
            .success(function(data) {
                $scope.formTrackablesData = {}; // clear the form so our user is ready to enter another
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