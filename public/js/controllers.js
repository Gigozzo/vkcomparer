'use strict';

/* Controllers */

var vkcomparerControllers = angular.module('vkcomparerControllers', []);

vkcomparerControllers.controller('GroupListCtrl', ['$scope', 'Group',
  function($scope, Group) {
    $scope.groups = Group.query();
    $scope.orderProp = 'age';
  }]);

vkcomparerControllers.controller('GroupDetailCtrl', ['$scope', '$routeParams', 'Group',
  function($scope, $routeParams, Group) {
    $scope.group = Group.get({groupId: $routeParams.groupId}, function(group) {
      $scope.mainImageUrl = group.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    };
  }]);
