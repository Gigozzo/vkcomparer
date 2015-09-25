'use strict';

/* Services */

var vkcomparerServices = angular.module('vkcomparerServices', ['ngResource']);

vkcomparerServices.factory('Group', ['$resource',
  function($resource){
//    return $resource('groups/:groupId.json', {}, {
//    return $resource('api/groups/:groupId', {}, {
//      query: {method:'GET', params:{groupId:'groups'}, isArray:true}
    return $resource('api/groups', {}, {
      query: {method:'GET', isArray:true}
    });
  }]);
