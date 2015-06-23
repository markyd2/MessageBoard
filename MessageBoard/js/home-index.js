// home-index.js
var module = angular.module("homeIndex", ["ngRoute"]);

module.config(function ($routeProvider) {
    $routeProvider.when("/", {
        controller: "topicsController",
        templateUrl: "/templates/topicsView.html"
    });

    $routeProvider.otherwise("/");
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