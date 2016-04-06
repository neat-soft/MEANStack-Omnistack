'use strict';

angular.module('fsaApp')
  .controller('CcformCtrl', function ($scope, $http, Auth, ngDialog, $window, usSpinnerService) {
    $scope.cardProcessing = false;
    // Generate client side CC processing
    var braintreeClient;
    $http.get('/api/tokens').success(function (clientTokenFromServer) {
      braintreeClient = new braintree.api.Client({clientToken: clientTokenFromServer});
    });
    // Set two-way binding for credit card form
    $scope.ccform = {
      expirationDate: {
        monthsInYear: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        yearsOnCards: []
        // Other options within this object include:
        // expirationMonth,
        // expirationYear
      },
      cardType: {
        visa: {deselected: false},
        mastercard: {deselected: false},
        discover: {deselected: false},
        jcb: {deselected: false},
        amex: {deselected: false}
      },
      validationMessages: {
        // should have properties:
        // formValidation:      Form validation error
        // nameValidation:      First name validation error
        // emailValidation:     Email regex validation error
        // cardRegex:           Errors regarding Credit card regex failed
        // invalidCVV:          Errors regarding Invalid cvv
        // invalidMonth:        Errors regarding Expiration month
        // invalidYear:         Errors regarding Expiration year
        // invalidZip:          Errors regarding Zipcode
        // cardWarning:         Warning about possible credit card bounce back
      }
      // Other properties generated from the HTML displayed below
      // cardType: 'amex, visa, mastercard, jcb, or discover',
      // emailAddress,
      // fullName,
      // cardNumber,
      // cvv,
      // zipCode
    };

    // Initialize cc number
    $scope.ccform.cardNumber = '';

    // Execute this function on submit
    var submitTransaction = function (creditCardObject) {
      braintreeClient.tokenizeCard({
        number: creditCardObject.cardNumber,
        expirationMonth: creditCardObject.expirationDate.expirationMonth,
        expirationYear: creditCardObject.expirationDate.expirationYear,
        cvv: creditCardObject.cvv,
        billingAddress: {
          postalCode: creditCardObject.zipCode
        }
      }, function (err, nonceFromBraintree) {
        if (err) {
          alert('There was an error processing your card. Braintree says: ' + err);
          return;
        }

        // Figure out which subjects to give access to
        var selectedSubjects = [];
        for (var subjectIndex = 0; subjectIndex < $scope.subjects.length; subjectIndex++) {
          var currentSubject = $scope.subjects[subjectIndex];
          if (currentSubject.currentClass === 'selected') {
            selectedSubjects.push(currentSubject.databaseName)
          }
        }

        var options = {
          nonceForServer: nonceFromBraintree,
          saleAmount: $scope.total,
          email: $scope.ccform.emailAddress,
          name: $scope.ccform.fullName,
          subjects: selectedSubjects
        };

        // send nonce to server and submit for settlement
        $http.post('/api/tokens/card', options).success(function (result) {
          /*      Account for error handling and switch post request with logged in check      */
          // make sure card was handled correctly
          if (result != 200) {
            //Stop Spinner
            $scope.stopSpin('spinner-1');
            $scope.ccform.validationMessages.cardWarning = result;
            //Re-Enable Button
            $scope.cardProcessing = false;
          } else {
            Auth.addSubjects(selectedSubjects, function (success) {
              //Stop Spinner
              $scope.stopSpin('spinner-1');
              // redirect to account page w/ exams
              $window.location.href = '/account';
              $scope.closeThisDialog();
            });
          }
          // Upgrade account if logged in
          // if (Auth.isLoggedIn()) {

          // } else {
          // Create new account if not logged in, but warn them first
          // ngDialog.open({
          //   template: 'components/alerts/you_are_not_logged_in.html',
          //   controller: 'YouAreNotLoggedInCtrl',
          //   scope: $scope,
          //   data: {
          //     subjects: selectedSubjects,
          //     email: $scope.ccform.emailAddress
          //   },
          //   showClose: false,
          //   closeByDocument: false,
          // })
          // // $scope.closeThisDialog();
          // alert('You must be logged in');
          // }
          // Close modal
        });
      });
    };

    // Determine CC month and year expiration options
    var getYearsOnCard = function () {
      var currentYear = new Date().getFullYear();
      var maxYear = currentYear + 15;
      for (var year = currentYear; year <= maxYear; year++) {
        $scope.ccform.expirationDate.yearsOnCards.push(year);
      }
    };
    getYearsOnCard();

    var formatActiveCards = function (arrayOfActiveCards) {
      // Deselect all cards
      var acceptedCards = $scope.ccform.cardType;
      for (var card in acceptedCards) {
        if (acceptedCards.hasOwnProperty(card)) {
          acceptedCards[card].deselected = true;
        }
      }
      //Select cards in array of active cards
      for (var cardIndex = 0; cardIndex < arrayOfActiveCards.length; cardIndex++) {
        var cardToSelect = arrayOfActiveCards[cardIndex];
        if (acceptedCards.hasOwnProperty(cardToSelect)) {
          acceptedCards[cardToSelect].deselected = false;
        }
      }
      return;
    };

    $scope.validateCard = function () {
      var activeCards = ['visa', 'mastercard', 'jcb', 'amex', 'discover'];
      $scope.ccform.validationMessages.cardRegex = '';
      // Check first digit of credit card number to identify the type of card
      var firstNumber = $scope.ccform.cardNumber[0];
      var secondNumber = $scope.ccform.cardNumber[1];
      switch (firstNumber) {
        case '4':
          activeCards = ['visa'];
          break;
        case '5':
          activeCards = ['mastercard'];
          break;
        case '6':
          activeCards = ['discover'];
          break;
        case '3':
          // Check to see if the card has at least two digits
          if (secondNumber) {
            // Check to see if it is American Express
            if (secondNumber == 4 || secondNumber == 7) {
              activeCards = ['amex'];
            } else {
              activeCards = ['jcb'];
            }
            // If card does not have two digits
          } else {
            activeCards = ['jcb', 'amex'];
          }
          break;
        case '':
        case null:
        case undefined:
          break;
        default:
          $scope.ccform.validationMessages.cardRegex = 'Please enter a valid Credit Card Number';
      }
      formatActiveCards(activeCards);
      var currentNumber = $scope.ccform.cardNumber;
      var cardNumberLength = $scope.ccform.cardNumber.length;
      var unformattedCardNumber = currentNumber.replace(/ /g, '');
      if ($scope.ccform.cardType.amex.deselected === false) {
        // format american express style, but first make sure it isn't already formatted correctly
        switch (unformattedCardNumber.length / 5) {
          case 1:
            $scope.ccform.cardNumber = unformattedCardNumber.substring(0, 4) + ' ' + unformattedCardNumber[4];
            break;
          case 2:
            $scope.ccform.cardNumber = unformattedCardNumber.substring(0, 4) + ' ' + unformattedCardNumber.substring(4) + ' ';
            break;
          case 3:
            $scope.ccform.cardNumber = unformattedCardNumber.substring(0, 4) + ' ' + unformattedCardNumber.substring(4, 10) + ' ' + unformattedCardNumber.substring(10);
            break;
          case 3.2:
            var newCardNumber = $scope.ccform.cardNumber.substring(0, 17);
            $scope.ccform.cardNumber = newCardNumber;
            break;
        }
        /* End card length formatting for amex cards */
      } else {
        // format card number in blocks of 4
        switch (unformattedCardNumber.length / 4) {
          case 1:
            $scope.ccform.cardNumber = unformattedCardNumber.substring(0, 4) + ' ';
            break;
          case 2:
            $scope.ccform.cardNumber = unformattedCardNumber.substring(0, 4) + ' ' + unformattedCardNumber.substring(4, 8) + ' ';
            break;
          case 3:
            $scope.ccform.cardNumber = unformattedCardNumber.substring(0, 4) + ' ' + unformattedCardNumber.substring(4, 8) + ' ' + unformattedCardNumber.substring(8, 12) + ' ';
            break;
          case 4:
            $scope.ccform.cardNumber = unformattedCardNumber.substring(0, 4) + ' ' + unformattedCardNumber.substring(4, 8) + ' ' + unformattedCardNumber.substring(8, 12) + ' ' + unformattedCardNumber.substring(12);
            break;
          case 4.25:
            var newCardNumber = $scope.ccform.cardNumber.substring(0, 19);
            $scope.ccform.cardNumber = newCardNumber;
            break;
        }
        /* End card length formatting for non-amex cards*/
      }
      /* End card length formatting for all cards */
    };
    /* End card length formatting and validation */

    // Function below called when CVV changes
    $scope.formatCVV = function () {
      // Clear errors
      $scope.ccform.validationMessages.invalidCVV = '';
      // Ensure cvv is always formatted as a number
      if ($scope.ccform.cvv && isNaN(Number($scope.ccform.cvv))) {
        $scope.ccform.validationMessages.invalidCVV = 'Please enter a valid CVV';
      }
      // ensure cvv can't be longer than the max
      if ($scope.ccform.cardType.amex.deselected === true && $scope.ccform.cvv.length === 4) {
        $scope.ccform.validationMessages.invalidCVV = 'Warning: Check to make sure you have entered your CVV correctly';
      }
    }

    // validate and submit form
    $scope.isValid = function () {
      var emailValidationRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var jcbRegex = /^(3088|3096|3112|3158|3337|352|353|354|355|356|357|358)\d{0,1}\s\d{4}\s\d{4}\s\d{4}/;
      var visaRegex = /^(4)\d{3}\s\d{4}\s\d{4}\s\d{4}/;
      var mastercardRegex = /^(5)\d{3}\s\d{4}\s\d{4}\s\d{4}/;
      var discoverRegex = /^(6)\d{3}\s\d{4}\s\d{4}\s\d{4}/;
      var amexRegex = /^(34|37)\d{2}\s\d{6}\s\d{5}/;
      var creditCardForm = $scope.ccform;
      // Make sure all fields are filled out
      var message = creditCardForm.validationMessages;
      var cardNumber = creditCardForm.cardNumber;
      if (Object.keys(creditCardForm).length !== 8) {
        message.formValidation = '- Please fill out all of the fields';
      } else {
        message.formValidation = '';
      }
      // Validate Full name
      if (creditCardForm.fullName.length < 5) {
        message.nameValidation = '- Please enter your name as it appears on your card';
      } else {
        message.nameValidation = '';
      }
      // Validate email address
      if (emailValidationRegex.test(creditCardForm.emailAddress)) {
        message.emailValidation = '';
      } else {
        message.emailValidation = '- Please enter a valid email address to send your receipt to';
      }
      // Validate credit card number
      if (jcbRegex.test(cardNumber) || visaRegex.test(cardNumber) || discoverRegex.test(cardNumber) || mastercardRegex.test(cardNumber) || amexRegex.test(cardNumber)) {
        message.cardRegex = '';
      } else {
        message.cardRegex = '- Please enter a valid credit card number';
      }
      // Validate zip code
      if (!creditCardForm.zipCode) {
        message.invalidZip = '- Please enter a valid zip code for card verification';
      } else {
        message.invalidZip = '';
      }

      if (!creditCardForm.cvv) {
        message.invalidCVV = '- Please enter a valid CVV for card verification';
      } else {
        message.invalidCVV = '';
      }

      // Confirm that there are no validation messages
      var countErrors = 0;
      var errorMessages = creditCardForm.validationMessages;
      for (var key in errorMessages) {
        if (errorMessages.hasOwnProperty(key)) {
          if (errorMessages[key] === '' || errorMessages[key] === null || errorMessages[key] === undefined || key ==='cardWarning') {
            continue;
          } else {
            countErrors++;
          }
        }
      }
      if (countErrors !== 0) {
        return;
      } else {
        //Disable Button
        $scope.cardProcessing = true;
        //Start Spinner
        $scope.startSpin('spinner-1');
        // continue the transaction
        submitTransaction($scope.ccform);
      }
    };


    $scope.startSpin = function (spinner) {
      usSpinnerService.spin(spinner);
    };
    $scope.stopSpin = function (spinner) {
      usSpinnerService.stop(spinner);
    };
  });
