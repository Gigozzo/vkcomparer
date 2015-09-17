'use strict';

/* Services */

var vkcomparerServices = angular.module('vkcomparerServices', ['ngResource']);

vkcomparerServices.factory('Group', ['$resource',
  function($resource){
    return $resource('groups/:groupId.json', {}, {
      query: {method:'GET', params:{groupId:'groups'}, isArray:true}
    });
  }]);
