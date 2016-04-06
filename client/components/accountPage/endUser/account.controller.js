'use strict';

angular.module('fsaApp')
  .controller('AccountCustomerCtrl', function ($window, $scope, Auth, $http, usSpinnerService) {
    $scope.allSubjects = {};
    $scope.discountPerUser = 0;
    $scope.premiumSubjects = [];
    $scope.freeSubjects = [];

    $scope.getMessageToUsers = function () {
      //Send users a message here!
      //$scope.message = 'Hi All!';
    };

    $scope.edmodoShare = function () {
      var url = 'https://www.edmodo.com/bookmarklet?url=';
      var urlToShare = 'https://omninox.org/signup/key/' + $scope.currentUser.email;
      var title = 'Omninox - Automatically graded AP Practice Questions';
      var edmodoLink = url + encodeURIComponent(urlToShare) + '&title=' + encodeURIComponent(title)
      $window.location.href = edmodoLink;
    };

    $scope.googleShare = function () {
      var url = 'https://plus.google.com/share?url=';
      var urlToShare = 'https://omninox.org/signup/key/' + $scope.currentUser.email;
      $window.location.href = url + encodeURIComponent(urlToShare);
    };

    $scope.emailShare = function () {
      var url = 'https://omninox.org/signup/key/' + $scope.currentUser.email;
      var subject = 'AP Practice Questions';
      var body = 'Hey, I found this website with automatically graded, timed AP practice questions. You can also ask for help in the global chat room. Use my invitation key to join: ' + url;

      $window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    };

    $scope.twitterShare = function () {
      var url = 'https://omninox.org';
      var urlToShare = url + '/signup/key/' + $scope.currentUser.email;

      $http.post('/api/shares/twitter', {url: urlToShare}).success(function (response) {
        if (!response) {
          alert('Unable to generate a short link. Please try again later');
          return;
        } else {
          var message = 'My invitation key for accessing online practice #APexams by @omninoxco ' + response.data.url;
          console.log(message);
          var twitterUrl = 'http://twitter.com/?status=' + encodeURIComponent(message);
          $window.location.href = twitterUrl;
        }
      });
    };

    $scope.fbShare = function () {
      var url = 'http://www.facebook.com/share.php?u=';
      var urlToShare = 'https://omninox.org/signup/key/' + $scope.currentUser.email;
      console.log(encodeURIComponent(urlToShare));
      $window.location.href = url + encodeURIComponent(urlToShare);
    };

    $scope.setDiscountPerUser = function () {
      if ($scope.currentUser.referral.connectionLevel === 1) {
        $scope.discountPerUser = 25;
      } else {
        $scope.discountPerUser = 5;
      }
    };

    $scope.hasFree = function (exams) {
      if (!exams.freeExams) {
        return false;
      }
      var keys = Object.keys(exams.freeExams);
      if (keys.length > 0) {
        return true;
      }
    };
    Auth.isLoggedInAsync(function (loggedIn) {
      if (loggedIn) {
        // user information is updated. Call initialization functions
        $scope.currentUser = Auth.getCurrentUser();
        $scope.fetchAllExams();
        $scope.setDiscountPerUser();
      }
    });

    //Fetch all exams
    $scope.fetchAllExams = function () {
      return;
      var getExams = false;
      if (getExams) {
        $http.get('api/users/exams/list/' + $scope.currentUser._id).success(function (subjects) {
          //$scope.allSubjects = subjects;
          if (subjects.premiumExams) {
            for (var subject in subjects.premiumExams) {
              if (subjects.premiumExams.hasOwnProperty(subject)) {
                $scope.premiumSubjects.push({
                  name: subject,
                  exams: subjects.premiumExams[subject]
                });
              }
            }
          }
          if (subjects.freeExams) {
            for (var subj in subjects.freeExams) {
              if (subjects.freeExams.hasOwnProperty(subj)) {
                $scope.freeSubjects.push({
                  name: subj,
                  exams: subjects.freeExams[subj]
                });
              }
            }
          }
          //Stop Spinner
          $scope.stopSpin('spinner-1');
          $scope.stopSpin('spinner-2');
        }).error(function (error) {
          //Stop Spinner
          $scope.stopSpin('spinner-1');
          $scope.stopSpin('spinner-2');
          console.log(error);
        });
      }
    };

    //Render score in % format
    $scope.score = function (score) {
      return ( score ? (score).toFixed(1) : 0 ) + '%';
    };

    //Render attempts
    $scope.attempts = function (attempts) {
      return (attempts) ? attempts : 0;
    };

    //Spinner
    $scope.startSpin = function (spinner) {
      usSpinnerService.spin(spinner);
    };
    $scope.stopSpin = function (spinner) {
      usSpinnerService.stop(spinner);
    };
  });
