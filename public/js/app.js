'use strict';

/* App Module */

var vkcomparerApp = angular.module('vkcomparerApp', [
  'ngRoute',
  'vkcomparerAnimations',

  'vkcomparerControllers',
  'vkcomparerFilters',
  'vkcomparerServices'
]);

vkcomparerApp.config(['$routeProvider',
  function($routeProvider) {
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
  }]);
