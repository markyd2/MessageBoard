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

    $routeProvider.when("/message/:id", {
        controller: "singleTopicController",
        templateUrl: "/templates/singleTopicView.html"
    });

    $routeProvider.otherwise({ redirectTo: "/" });
});

module.factory("dataService", function ($http, $q) {

    var _topics = [];
    var _isInit = false;
    var _isReady = function () {
        return _isInit;
    };

    var _getTopics = function () {

        var deferred = $q.defer();

        $http.get("/api/v1/topics?includeReplies=true")
            .then(function (result) {
                // Success
                angular.copy(result.data, _topics);
                _isInit = true;
                deferred.resolve();
            },
            function () {
                // Error
                deferred.reject();
            
            });

        return deferred.promise;
    };

    var _addTopic = function (newTopic) {

        var deferred = $q.defer();

        $http.post("/api/v1/topics", newTopic)
            .then(function (result) {
                // Success
                var newlyCreatedTopic = result.data;
                _topics.splice(0, 0, newlyCreatedTopic);
                deferred.resolve(newlyCreatedTopic);
            },
            function () {
                // Error
                deferred.reject();
            });

        return deferred.promise;
    };

    var _findTopic = function (id) {
        var found = null;

        $.each(_topics, function (i, item) {
            if (item.id == id) {
                found = item;
                return false;
            }
        });

        return found;
    };

    var _getTopicById = function (id) {

        var deferred = $q.defer();

        if (_isReady()) {
            var topic = _findTopic(id);
            if (topic) {
                deferred.resolve(topic);
            }
            else {
                deferred.reject();
            }
        }
        else {
            _getTopics()
                .then(function () {
                    // Success
                    var topic = _findTopic(id);
                    if (topic) {
                        deferred.resolve(topic);
                    }
                    else {
                        deferred.reject();
                    }
                },
                function () {
                    // Error
                    deferred.reject();
                });
        }

        return deferred.promise;
    };

    var _saveReply = function (topic, newReply) {

        var deferred = $q.defer();

        $http.post("/api/v1/topics/" + topic.id + "/replies", newReply)
            .then(function (result) {
                // Success
                if (topic.replies == null) topic.replies = [];

                topic.replies.push(result.data);
                deferred.resolve(result.data);
            },
            function () {
                // Error
                deferred.reject();
            });

        return deferred.promise;
    };

    return {
        topics: _topics,
        getTopics: _getTopics,
        addTopic: _addTopic,
        isReady: _isReady,
        getTopicById: _getTopicById,
        saveReply : _saveReply
    };
});

module.controller("topicsController", function ($scope, $http, dataService) {
    $scope.data = dataService;
    $scope.isBusy = false;

    if (dataService.isReady() == false) {
        $scope.isBusy = true;

        dataService.getTopics()
            .then(function () {
                // Success
            },
            function () {
                // Error
                alert("could not load topics");
            })
            .then(function () {
                $scope.isBusy = false;
            });
    }
});

module.controller("newTopicController", function ($scope, $http, $window, dataService) {
    $scope.newTopic = {};

    $scope.save = function () {

        dataService.addTopic($scope.newTopic)
            .then(function () {
                // Success
                $window.location = "#/";
            },
            function () {
                // Error
                alert("could not add new topic");
            });
    };
});

module.controller("singleTopicController", function ($scope, dataService, $window, $routeParams) {
    $scope.topic = null;
    $scope.newReply = {};

    dataService.getTopicById($routeParams.id)
        .then(function (topic) {
            // Success
            $scope.topic = topic;
        },
        function () {
            // Error
            $window.location = "#/";
        });

    $scope.addReply = function () {
        dataService.saveReply($scope.topic, $scope.newReply)
            .then(function () {
                // Success
                $scope.newReply.body = "";
            },
            function () {
                // Error
                alert("could not save the new reply");
            });
    };
});