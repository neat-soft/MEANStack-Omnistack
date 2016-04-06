'use strict';

angular.module('fsaApp')
  .factory('User', function ($resource) {
    return $resource(
      '/api/users/:id/:controller',
      {
        id: '@_id'
      },
      {
        changeRole: {
          method: 'PUT',
          params: {
            controller: 'role'
          }
        },
        changePassword: {
          method: 'PUT',
          params: {
            controller:'password'
          }
        },
        updateInfo: {
          method: 'PUT',
          params: {
            controller:'update'
          }
        },
        addSubjects: {
          method: 'PUT',
          params: {
            controller:'subject'
          }
        },
        get: {
          method: 'GET',
          params: {
            id:'me'
          }
        }
      });
  });
