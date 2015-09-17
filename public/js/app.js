'use strict';

/* App Module */

var vkcomparerApp = angular.module('vkcomparerApp', [
  'ngRoute',
  'vkcomparerAnimations',

  'vkcomparerControllers',
  'vkcomparerFilters',
  'vkcomparerServices'
]);

vkcomparerApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/groups', {
        templateUrl: 'partials/group-list.html',
        controller: 'GroupListCtrl'
      }).
      when('/groups/:groupId', {
        templateUrl: 'partials/group-details.html',
        controller: 'GroupDetailCtrl'
      }).
      otherwise({
        redirectTo: '/groups'
      });

      $locationProvider.html5Mode(true);
  }]);
