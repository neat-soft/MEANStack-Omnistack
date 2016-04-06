'use strict';

angular.module('fsaApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, toastr, $cookieStore, $q) {
    var currentUser = {};
    if($cookieStore.get('token')) {
      currentUser = User.get(function(user) {
        if (user.name !== $rootScope.userName) {
          $rootScope.userName = user.name;
        }
      });
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get( function(user) {
            $rootScope.userName = user.name;
            console.log('set username to ' + currentUser.name);
          });
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        $rootScope.userName = undefined;
        currentUser = {};
        toastr.clear();
        delete $rootScope.initialized;
        //$cookieStore.remove('blockedUsers');
        //$cookieStore.remove('blockedMessages');
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.save(user,
          function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUserFromKey: function(user, callback) {
        var cb = callback || angular.noop;
        var userForm = user;
        user.referral = {
            referrer: user.key
          };

        return User.save(userForm,
          function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },
      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Gives a subject to a user
       *
       * @param {String} Subject
       * @return {Promise}
       */
      addSubjects: function(subjects, callback) {
        var cb = callback || angular.noop;
        return User.addSubjects({ id: currentUser._id }, {
          subjects: subjects
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },


      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      getCurrentUserAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(currentUser);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(currentUser);
        } else {
          cb(false);
        }
      },

      /**
       * Check if user has a certain role
       */
      is: function(role, cb) {
        cb = cb || angular.noop;
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            if (currentUser.role === role || currentUser.academicRole === role) {
              return cb(true);
            }
            else {
              return cb(false);
            }
          }).catch(function() {
            return cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          if (currentUser.role === role || currentUser.academicRole === role) {
            return cb(true);
          }
          else {
            return cb(false);
          }
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Check if a user is an Teacher
       *
       * @return {Boolean}
       */
      isTeacher: function() {
        return currentUser.academicRole === 'Teacher';
      },

      /**
       * Check if a user is a Student
       *
       * @return {Boolean}
       */
      isStudent: function() {
        return currentUser.academicRole === 'Student';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      },

      /**
       * Generates a forgot password token and sends it via e-mail
       *
       * @param  {Object}   user
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      forgot: function(email) {
        var deferred = $q.defer();

        $http.post('/api/forgot-password/generateToken', {
          email: email
        }).
          success(function(data) {
            deferred.resolve(data);
          }).
          error(function(err) {
            deferred.reject(err);
          }.bind(this));
        return deferred.promise;
      },

      /**
      * Put in a beta request for a user
      */
      requestBeta: function(request, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/emails/request', {
          email: request.email,
          role: request.role
        }).success(function(data) {
          return cb();
        }).
        error(function(err) {
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },
      /**
       * Reset password
       *
       * @param  {String}   token
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      resetPassword: function(token, newPassword) {
        var deferred = $q.defer();
        $http.post('/api/forgot-password/resetPassword', {
          token: token,
          newPassword: newPassword
        }).
          success(function(data) {
            deferred.resolve(data);
          }).
          error(function(err) {
            deferred.reject(err);
          }.bind(this));
        return deferred.promise;
      },

      changeInfo: function(userInfo, callback) {
        var cb = callback || angular.noop;
        return User.updateInfo({ id: currentUser._id}, userInfo,
        function(user) {
          return cb(false, user);
        },
        function(err) {
          return cb(err);
        }).$promise;
      },

      getBetaKey: function(key, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        var getUrl = '/api/betaKeys/' + key;
        $http.get(getUrl)
          .success(function(data) {
            return cb(data);
          })
          .error(function() {
            return cb('Error');
          }.bind(this));

        return deferred.promise;
      },

      addNewSurvey: function(survey, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('/api/surveys', survey)
          .success(function() {
            return cb();
          })
          .error(function(err) {
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },
      addNewBetaKey: function(key, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('/api/betaKeys', key)
          .success(function() {
            return cb();
          })
          .error(function(err) {
            return cb(err);
          }.bind(this));
        return deferred.promise;
      },

      validateBetaKey: function(key, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        var getUrl = '/api/betaKeys/validate/' + key;
        $http.get(getUrl)
        .success(function(data) {
          $cookieStore.put('betaKey', data);
          return cb();
        })
        .error(function(err) {
          return cb(err);
        }.bind(this));
        return deferred.promise;
      }
    };
  });
