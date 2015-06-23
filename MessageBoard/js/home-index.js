// home-index.js
var module = angular.module("homeIndex", ["ngRoute"]);

module.config(function ($routeProvider) {
    $routeProvider.when("/", {
        controller: "topicsController",
        templateUrl: "/templates/topicsView.html"
    });

    $routeProvider.when("/newmessage", {
        controller: "newTopicController",
        templateUrl: "/templates/newTopicView.html"
    });

    $routeProvider.otherwise({ redirectTo: "/" });
});

module.controller("topicsController", function ($scope, $http) {
    $scope.data = [];
    $scope.isBusy = true;

    $http.get("/api/v1/topics?includeReplies=true")
        .then(function (result) {
            // Success
            angular.copy(result.data, $scope.data);
        },
        function () {
            // Error
            alert("could not load topics");
        })
        .then(function () {
            $scope.isBusy = false;
        });
});

module.controller("newTopicController", function ($scope, $http, $window) {
    $scope.newTopic = {};

    $scope.save = function () {
        alert($scope.newTopic.title);
    };

    //$http.get("/api/v1/topics?includeReplies=true")
    //    .then(function (result) {
    //        // Success
    //        angular.copy(result.data, $scope.data);
    //    },
    //    function () {
    //        // Error
    //        alert("could not load topics");
    //    })
    //    .then(function () {
    //        $scope.isBusy = false;
    //    });
});