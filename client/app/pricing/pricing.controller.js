'use strict';

angular.module('fsaApp')
  .controller('PricingCtrl', function ($scope, $http, $routeParams, ngDialog, Auth, $location, $window, usSpinnerService) {
    var numFree;
    var activeSubjects;
    var user;
    $scope.paypalProcessing=false;
    $scope.freeBtnDisabled = false;

    Auth.isLoggedInAsync(function (isLoggedIn) {
      if (isLoggedIn) {
        user = Auth.getCurrentUser();
        numFree = 0;
        $scope.subjects = getAllSubjects();
        $scope.couponCode = $routeParams.couponCode;
        $scope.numFreePicked = 0;
        $scope.numPicked = 0;

        activeSubjects = user.subjects;
        numFree = user.numFreeSubjects;
        for(var subject = 0; subject < activeSubjects.length; subject++){
          var subjectToFind = activeSubjects[subject].subjectName;
          for(var subjectObject = 0; subjectObject < $scope.subjects.length; subjectObject++) {
            if ($scope.subjects[subjectObject].databaseName === subjectToFind) {
              $scope.subjects[subjectObject].currentClass = 'blocked';
              break;
            }
          }
        }
      } else {
        console.log('user is not logged in');
      }
    });

    // This function is triggered on clicking the checkout button
    $scope.showCCForm = function () {
      ngDialog.open({
        template:'components/ccform/ccform.html',
        controller: 'CcformCtrl',
        scope: $scope
      });
    };

    $scope.submitCouponCode = function() {
      if($scope.couponCode) {
        $http.get('/api/coupons/getByCode/' + $scope.couponCode).success(function (coupon) {
          $scope.couponMessage = coupon.subjectName + ' is free!';

          angular.forEach($scope.subjects, function (subject) {
            delete subject.isFree;
            if (subject.databaseName === coupon.subjectName) {
              subject.isFree = true;
            }
          });

          var selectedSubjects = getSelectedSubjects();
          var index = selectedSubjects.indexOf(coupon.subjectName);
          if (index > -1) {
            numFree = user.numFreeSubjects + 1;

            calculatePayment()
          }
        }).
        error(function(err) {
            angular.forEach($scope.subjects, function (subject) {
              delete subject.isFree;
            });
            $scope.couponMessage = err.message;
            numFree = user.numFreeSubjects;

            calculatePayment()
        });
      }
    };

    function calculatePayment(){
      if($scope.numPicked > numFree){
        $scope.numFreePicked = numFree;
      } else {
        $scope.numFreePicked = $scope.numPicked;
      }

      $scope.totalWithoutDiscount = ($scope.numPicked * 12.00).toFixed(2);
      $scope.total = (($scope.totalWithoutDiscount - ($scope.numFreePicked * 12.00)) * (1 - user.discountPercent)).toFixed(2);
      $scope.discountPercent = Math.round(100 - (($scope.total / $scope.totalWithoutDiscount) * 100));
    }

    function claimCoupon(){
      $http.post('/api/coupons/use/' + $scope.couponCode);
    }

    $scope.submitCouponCode();

    // This function is called if user get only free subjects.
    $scope.redeemFree = function() {
      $scope.startSpin('spinner-free');
      $scope.freeBtnDisabled = true;
      var selectedSubjects = getSelectedSubjects();
      Auth.addSubjects(selectedSubjects, function(success) {
        claimCoupon();
        $scope.stopSpin('spinner-free');
        $window.location.href = '/account';
      }, function(error) {
        console.log(error);
        $scope.stopSpin('spinner-free');
        $scope.freeBtnDisabled = false;
      });
    };

    function getSelectedSubjects() {
      var selectedSubjects = [];
      for(var subjectIndex = 0; subjectIndex < $scope.subjects.length; subjectIndex++) {
        var currentSubject = $scope.subjects[subjectIndex];
        if (currentSubject.currentClass === 'selected') {
          selectedSubjects.push(currentSubject.databaseName);
        }
      }
      return selectedSubjects;
    }
    // This function happens after user has successfully authenticated paypal
    var requestSale = function (totalAmount, paypalNonce, paypalEmail) {
      // Figure out which subjects to give access to
      var selectedSubjects = [];
      for (var subjectIndex = 0; subjectIndex < $scope.subjects.length; subjectIndex++) {
        var currentSubject = $scope.subjects[subjectIndex];
        if (currentSubject.currentClass === 'selected') {
          selectedSubjects.push(currentSubject.databaseName);
        }
      }
      // Pass transaction parameters
      var transaction = {
        amount: totalAmount,
        nonce: paypalNonce,
        subjects: selectedSubjects,
        email: paypalEmail
      };
      //Show Spinner
      $scope.startSpin('spinner-paypal');
      $scope.paypalProcessing=true;
      // give access based on whether user is logged in or not
      $http.post('/api/tokens', transaction).success(function (result) {
        Auth.addSubjects(selectedSubjects, function (success) {
          claimCoupon();
          // redirect to account page w/ exams
          $window.location.href = '/account';
          // send receipt through email
          // alert('subjects added successfully');
        });
      });
    };

    // Generate client token as soon as user reaches page
    $http.get('/api/tokens').success(function (clientTokenFromServer) {
      braintree.setup(clientTokenFromServer, 'paypal', {
        container: angular.element('#paypal-btn'),
        onSuccess: function (nonce, email) {
          requestSale($scope.total, nonce, email);
        },
        singleUse: true
      });
    });

    $scope.total = 0;

    // Function for when user clicks on a subject
    $scope.select = function(subject){
      if(subject.currentClass === 'unselected'){

        if(subject.isFree){
          numFree++;
        }
        if (numFree > $scope.numFreePicked) {
          $scope.numFreePicked += 1;
          $scope.numPicked += 1;
          subject.currentClass = 'selected';
        }
        else {
          subject.currentClass = 'selected';
          $scope.numPicked += 1;
        }
      } else if (subject.currentClass === 'selected') {

        if(subject.isFree){
          numFree--;
        }
        $scope.numPicked -= 1;
        if ($scope.numPicked <= $scope.numFreePicked) {
          $scope.numFreePicked = $scope.numPicked;
        }
        subject.currentClass = 'unselected';
      }

      calculatePayment();
    };

    function getAllSubjects() {
      var subjects = [
      {
        subjectName: 'AP Calculus AB',
        idName: 'calcab',
        currentClass: 'unselected',
        databaseName: 'APCalcAB'
      },
      {
        subjectName: 'AP Calculus BC',
        idName: 'calcbc',
        currentClass: 'unselected',
        databaseName: 'APCalcBC'
      },
      {
        subjectName: 'AP Physics 1',
        idName: 'physone',
        currentClass: 'unselected',
        databaseName: 'APPhysics1'
      },
      {
        subjectName: 'AP Physics 2',
        idName: 'phystwo',
        currentClass: 'unselected',
        databaseName: 'APPhysics2'
      },
      {
        subjectName: 'AP Statistics',
        idName: 'stats',
        currentClass: 'unselected',
        databaseName: 'APStats'
      },
      // {
      //   subjectName: 'AP Computer Science',
      //   idName: 'compsci',
      //   currentClass: 'unselected',
      //   databaseName: 'APCompSci'
      // },
      // {
      //   subjectName: 'AP English Language',
      //   idName: 'englang',
      //   currentClass: 'unselected',
      //   databaseName: 'APEngLanguage'
      // },
      // {
      //   subjectName: 'AP English Literature',
      //   idName: 'englit',
      //   currentClass: 'unselected',
      //   databaseName: 'APEngLiterature'
      // },
      {
        subjectName: 'AP European History',
        idName: 'eurhis',
        currentClass: 'unselected',
        databaseName: 'APEurHistory'
      },
      {
        subjectName: 'AP US History',
        idName: 'ushis',
        currentClass: 'unselected',
        databaseName: 'APUSHistory'
      },
      {
        subjectName: 'AP World History',
        idName: 'worldhis',
        currentClass: 'unselected',
        databaseName: 'APWorldHistory'
      },
      // {
      //   subjectName: 'AP Microeconomics',
      //   idName: 'micro',
      //   currentClass: 'unselected',
      //   databaseName: 'APMicroecon'
      // },
      // {
      //   subjectName: 'AP Macroeconomics',
      //   idName: 'macro',
      //   currentClass: 'unselected',
      //   databaseName: 'APMacroecon'
      // },
      {
        subjectName: 'AP Psychology',
        idName: 'psych',
        currentClass: 'unselected',
        databaseName: 'APPsych'
      },
      {
        subjectName: 'AP Biology',
        idName: 'bio',
        currentClass: 'unselected',
        databaseName: 'APBio'
      },
      {
        subjectName: 'AP Chemistry',
        idName: 'chem',
        currentClass: 'unselected',
        databaseName: 'APChem'
      },
      {
        subjectName: 'AP Envir. Science',
        idName: 'envsci',
        currentClass: 'unselected',
        databaseName: 'APEnvSci'
      },
      // {
      //   subjectName: 'AP Spanish Language',
      //   idName: 'span',
      //   currentClass: 'unselected',
      //   databaseName: 'APSpanLanguage'
      // },
      {
        subjectName: 'AP US Government',
        idName: 'usgov',
        currentClass: 'unselected',
        databaseName: 'APUSGovt'
      },
      {
        subjectName: 'AP Human Geography',
        idName: 'humgeo',
        currentClass: 'unselected',
        databaseName: 'APHumGeo'
      }
      ];
      return subjects;
    }


    $scope.startSpin = function (spinner) {
      usSpinnerService.spin(spinner);
    };
    $scope.stopSpin = function (spinner) {
      usSpinnerService.stop(spinner);
    };
  });
