'use strict';

angular.module('fsaApp')
  .controller('ChatCtrl', function ($rootScope, $scope, $http, socket, Auth, $location, $timeout, $cookieStore, SubjectNames) {
    $scope.glued = true;
    $scope.blocked = true;
    $scope.blockedPerm = false;
    $scope.tabs = [];
    $scope.moreTabs = [];
    $scope.awesomeChats = [];
    $scope.currentUser = Auth.getCurrentUser();
    $scope.freeUserMsg = "You must have purchased a practice exam set to access this room"; //Free user's Message for Premium Room
    $scope.blockedUserMsgTemp = "You have been temporarily blocked and your messages will not appear to other users until you log out and log back in again because of the following message:"; //Temporary Blocked user's Message
    $scope.blockedUserMsgPerm = "You have been Permanently blocked and your messages will not appear to other users because of the following message:"; //Permanaently Blocked user's Message
    $scope.blockedUsers = [];
    $scope.blockedMessages = [];
    $scope.sessionBlockedUsers = [];
    $scope.usersData = [];
    $rootScope.scrolledInitialized = [];
    $rootScope.scrolledRooms = [];
    $rootScope.earlierRoom = null;
    $scope.subjectNames = SubjectNames;

    //local vars
    var userSent;
    var userEmail = $scope.currentUser['email'];
    var userName = $scope.currentUser['name'];
    var isAdmin = Auth.isAdmin();
    var chatBoxTitle = "Omninox Global Chat";

    $scope.title = chatBoxTitle;

    //Watch For Auth Change
    $scope.$watch('Auth', function () {
      userEmail = $scope.currentUser['email'];
      userName = $scope.currentUser['name'];
      isAdmin = Auth.isAdmin();
    });

    $scope.chatNotAllowed = function () {
      return $location.path() != '/settings' && $location.path() != '/account' && $location.path() != '/admin' && $location.path() != "/teacher" && (!(/^\/account\/(?:([^\/]+))\/(?:([^\/]+))\/(?:([^\/]+))$/.test($location.path())));
    };
    // Fetch All Rooms and create Tabs
    $scope.fetchAllRooms = function () {
      $scope.tabs.length = 0;
      $scope.moreTabs.length = 0;
      $http.get('/api/chatrooms').success(function (rooms) {
        if (rooms.length) {
          for (var i = 0; i < (rooms.length <= 2 ? rooms.length : 2); ++i) {
            $scope.tabs.push(rooms[i]);
          }
          if (rooms.length > 2 && rooms.length <= 3) {
            $scope.moreTabs.push(rooms[2]);
            $scope.roomNameMore = rooms[2].name;
          } else {
            $scope.roomNameMore = "More";
            for (var i = 2; i < rooms.length; ++i) {
              $scope.moreTabs.push(rooms[i]);
            }
          }
          $scope.roomID = $scope.tabs[0]['_id'];
          $scope.roomName = $scope.tabs[0]['name'];
          $scope.roomType = $scope.tabs[0]['roomType'];
        }
      });
    };

    //Show Chatbox on  settings and account pages
    if ($scope.chatNotAllowed()) {
      $rootScope.showChatBox = false;
    }

    //Check if user is blocked by admin before he could actually logs in
    $scope.checkBlockedUsers = function () {
      if (typeof userEmail != 'undefined') {
        $http.get('/api/blockusers/get/' + userEmail).success(function (user) {
          if (user.length > 0) {
            $scope.blockedUsers = user;
            for (var i = 0; i < user.length; ++i) {
              var userData = user[i];
              //If User is blocked
              if (userData.email == userEmail && userData.type == 1) {
                //socket.unsyncUpdates('chatmessage');
                $scope.blocked = true;
                $http.get('/api/chatarchives/' + userData.message).success(function (msg) {
                  $scope.blockedMessages.push({name: msg.name, message: msg.message});
                });
              }
              else if (userData.email == userEmail && userData.type == 2) {
                //socket.unsyncUpdates('chatmessage');
                $scope.blocked = true;
                $scope.blockedPerm = true;
                $scope.awesomeChats.length = 0;
                $scope.blockedUsers.length = 0;
                $scope.blockedMessages.length = 0;
                $http.get('/api/chatarchives/' + userData.message).success(function (msg) {
                  $scope.blockedMessages.push({name: msg.name, message: msg.message});
                });
              } else {
                $scope.blocked = false;
              }
            }
          } else {
            $scope.blocked = false;
          }
        });
      }
    };


    //check if session exists
    if (!isAdmin) {
      $scope.checkBlockedUsers();
    } else {
      $scope.blocked = false;
    }

    //Check if chat messages are overflowing (To remove Good luck notifications after a limit)
    var checkForMaxBuffer = function () {
      if ($scope.awesomeChats.length > 29) {
        $scope.awesomeChats.shift();
      }
    };

    //Check if user has changed exam (To remove Good luck notifications if user switched exam)
    var checkForDuplicates = function (notification) {
      for (var i = 0; i < $scope.awesomeChats.length; ++i) {
        if (typeof $scope.awesomeChats[i].notification != 'undefined') {
          if (notification.user._id == $scope.awesomeChats[i].user._id) {
            var dupl = $scope.awesomeChats.filter(function (chat) {
              if (typeof chat.notification != 'undefined') {
                return chat.user._id == notification.user._id;
              }
            });
            if (dupl.length > 1) {
              $scope.awesomeChats.splice(i, 1);
            }
            if (typeof ($scope.awesomeChats[i].notification.examOver) !== 'undefined' && $scope.awesomeChats[i].notification.examOver) {
              delete notification.user._id;
              delete $scope.awesomeChats[i].user._id;
            }
          }
        }
      }
    };

    //Check if notification exists and remove
    var removeNotification = function (notification) {
      for (var i = 0; i < $scope.awesomeChats.length; ++i) {
        if (typeof $scope.awesomeChats[i].notification != 'undefined') {
          if (notification.user._id == $scope.awesomeChats[i].user._id) {
            $scope.awesomeChats.splice(i, 1);
          }
        }
      }
    };

    /*Sync Good Luck Notifications*/
    $scope.syncNotificationUpdates = function () {
      socket.syncUpdates('exam', $scope.awesomeChats, function (action, notification) {
        if (action === 'notificationCreated') {
          $scope.awesomeChats.push(notification);
          checkForDuplicates(notification);
        }
        if (action === 'notificationDeleted') {
          removeNotification(notification);
        }
        checkForMaxBuffer();
      });
    };

    $scope.$on('$routeChangeSuccess', function () {
      $scope.syncNotificationUpdates();
    });

    //On Page Refresh or Direct page Load
    Auth.isLoggedInAsync(function (loggedIn) {
      if (loggedIn) {
        //Check if user has blocked any other user
        if ($cookieStore.get('token')) {
          //Show Chatbox on  settings and account pages
          if ($scope.chatNotAllowed()) {
            $rootScope.showChatBox = false;
          } else {
            //Update User info
            $scope.blocked = false;
            $scope.currentUser = Auth.getCurrentUser();
            userEmail = $scope.currentUser['email'];
            userName = $scope.currentUser['name'];
            isAdmin = Auth.isAdmin();
            if (typeof userEmail != 'undefined') {
              $scope.fetchAllRooms();
              $rootScope.showChatBox = true;
              if (typeof $rootScope.initialized == 'undefined' || $rootScope.initialized == false) {
                $http.get('/api/chatmessages/').success(function (chatmsgs) {
                  if ($scope.roomType == 'premium' && $scope.currentUser.role == 'user') {
                  } else {
                    var messageSeperator = [];
                    $scope.awesomeChats = chatmsgs;
                    //Put Message seperator for older messages
                    for (var i = $scope.awesomeChats.length - 1; i >= 0; --i) {
                      $scope.awesomeChats[i].isOldMsg = true;
                      if (messageSeperator.indexOf($scope.awesomeChats[i].roomID) < 0) {
                        $scope.awesomeChats[i].older = true;
                        messageSeperator.push($scope.awesomeChats[i].roomID);
                      }
                    }
                  }
                  //chat pop msg
                  socket.syncUpdates('chatmessage', $scope.awesomeChats, function (action, chat) {
                    //Pop Recent Message
                    var roomType;
                    for (var i = 0; i < $scope.tabs.length; ++i) {
                      if ($scope.tabs[i]._id === chat.roomID) {
                        roomType = $scope.tabs[i].roomType;
                      }
                    }
                    if (action === "created") {
                      var scroller = angular.element('[scrollable=true]');
                      scroller.each(function (a, b) {
                        angular.element(b).bind('scroll', function () {
                          $scope.userScrolled($scope.roomID);
                        });
                        if (angular.element(b).attr('room') === $scope.roomID && $rootScope.scrolledRooms.indexOf($scope.roomID) < 0) {
                          b.scrollTop = b.scrollHeight;
                        } else if (angular.element(b).attr('room') === $scope.roomID && $rootScope.scrolledRooms.indexOf($scope.roomID) > -1 && userEmail == chat.email) {
                          b.scrollTop = b.scrollHeight;
                          $rootScope.scrolledRooms.splice($rootScope.scrolledRooms.indexOf($scope.roomID), 1);
                        }
                      });
                      if (roomType == 'premium' && $scope.currentUser.role == 'user') {
                      } else {
                        $scope.title = $scope.popChatUser(chat) + " : " + chat.message;
                        if (typeof $scope.idleTimeout !== "undefined") {
                          $timeout.cancel($scope.idleTimeout);
                        }
                        $scope.idleTimeout = $timeout(function () {
                          $scope.title = chatBoxTitle;
                          $timeout.cancel($scope.idleTimeout);
                        }, 3000);
                      }
                    }
                    checkForMaxBuffer();
                  });
                });
                $scope.syncNotificationUpdates();
                $rootScope.initialized = true;
              }
            }
          }

          //get blocked users if session found
          if ($cookieStore.get('sessionBlockedUsers')) {
            $scope.sessionBlockedUsers = $cookieStore.get('sessionBlockedUsers');
          }
        } else {
          //Show Chatbox on  settings and account pages
          if ($scope.chatNotAllowed()) {
          }
          // Remove blocked users on fresh login
          $cookieStore.remove('sessionBlockedUsers');
          $cookieStore.remove('chatVisible');
          $scope.sessionBlockedUsers.length = 0;
        }
      }
    });

    //Observe Path change
    $rootScope.$on('$routeChangeStart', function () {
      Auth.isLoggedInAsync(function (loggedIn) {
        if (loggedIn) {
          if ($scope.chatNotAllowed()) {
            $rootScope.showChatBox = false;
          } else {
            //Update User info
            $scope.blocked = false;
            $scope.currentUser = Auth.getCurrentUser();
            userEmail = $scope.currentUser['email'];
            userName = $scope.currentUser['name'];
            isAdmin = Auth.isAdmin();
            if (typeof userEmail != 'undefined') {
              $scope.fetchAllRooms();
            }
            $cookieStore.remove('sessionBlockedUsers');
            $scope.sessionBlockedUsers.length = 0;
            $scope.checkBlockedUsers();
            //Show Chatbox on  settings and account pages
            $rootScope.showChatBox = true;
            if (typeof $rootScope.initialized == 'undefined' || $rootScope.initialized == false) {
              $http.get('/api/chatmessages/').success(function (chatmsgs) {
                if ($scope.roomType == 'premium' && $scope.currentUser.role == 'user') {
                } else {
                  var messageSeperator = [];
                  //Put Message seperator for older messages
                  $scope.awesomeChats = chatmsgs;
                  for (var i = $scope.awesomeChats.length - 1; i >= 0; --i) {
                    $scope.awesomeChats[i].isOldMsg = true;
                    if (messageSeperator.indexOf($scope.awesomeChats[i].roomID) < 0) {
                      $scope.awesomeChats[i].older = true;
                      messageSeperator.push($scope.awesomeChats[i].roomID);
                    }
                  }
                }
                socket.syncUpdates('chatmessage', $scope.awesomeChats, function (action, chat) {
                  //Pop Recent Message
                  var roomType;
                  for (var i = 0; i < $scope.tabs.length; ++i) {
                    if ($scope.tabs[i]._id === chat.roomID) {
                      roomType = $scope.tabs[i].roomType;
                    }
                  }
                  if (action === "created") {
                    var scroller = angular.element('[scrollable=true]');
                    scroller.each(function (a, b) {
                      angular.element(b).bind('scroll', function () {
                        $scope.userScrolled($scope.roomID);
                      });
                      if (angular.element(b).attr('room') === $scope.roomID && $rootScope.scrolledRooms.indexOf($scope.roomID) < 0) {
                        b.scrollTop = b.scrollHeight;
                      } else if (angular.element(b).attr('room') === $scope.roomID && $rootScope.scrolledRooms.indexOf($scope.roomID) > -1 && userEmail == chat.email) {
                        b.scrollTop = b.scrollHeight;
                        $rootScope.scrolledRooms.splice($rootScope.scrolledRooms.indexOf($scope.roomID), 1);
                      }
                    });
                    if (roomType == 'premium' && $scope.currentUser.role == 'user') {
                    } else {
                      $scope.title = $scope.popChatUser(chat) + " : " + chat.message;
                      if (typeof $scope.idleTimeout !== "undefined") {
                        $timeout.cancel($scope.idleTimeout);
                      }
                      $scope.idleTimeout = $timeout(function () {
                        $scope.title = chatBoxTitle;
                        $timeout.cancel($scope.idleTimeout);
                      }, 3000);
                    }
                  }
                  checkForMaxBuffer();
                });
              });
              $scope.syncNotificationUpdates();
              $rootScope.initialized = true;
            }
          }
        } else {
          if (!$scope.blockedPerm) {
            //Reset Vars on logout
            $scope.newChat = '';
            $scope.awesomeChats.length = 0;
            $scope.blockedUsers.length = 0;
            $scope.blockedMessages.length = 0;
            $cookieStore.remove('sessionBlockedUsers');
            $cookieStore.remove('chatVisible');
            $scope.sessionBlockedUsers.length = 0;
            if (!isAdmin && typeof userEmail != 'undefined') {
              $http.get('/api/blockusers/get/' + userEmail).success(function (user) {
                if (user.length > 0) {
                  for (var i = 0; i < user.length; ++i) {
                    var userData = user[i];
                    if (userData.email == userEmail && userData.type == 1) {
                      $http.delete('/api/blockusers/' + userData._id);
                      $http.delete('/api/chatmessages/email/' + userData.email);
                    }
                  }
                }
              });
            }
          } else {
            $scope.awesomeChats.length = 0;
            $scope.blockedUsers.length = 0;
            $scope.blockedMessages.length = 0;
          }
          $rootScope.showChatBox = false;
          if ($scope.chatNotAllowed()) {
          }
        }
      });
    });


    //Listen for Chat Messages
    //socket.syncUpdates('chatmessage', $scope.awesomeChats);

    //Listen for Omnipoints Updates
    socket.syncUpdates('user', $scope.usersData, function (action, doc) {
      for (var i = 0; i < $scope.awesomeChats.length; ++i) {
        if ($scope.awesomeChats[i].email == doc.email) {
          $scope.awesomeChats[i].omnipoints = abbreviateNumber(doc.omnipoints, 1);
        }
      }
    });

    //Listen for Blocked users
    socket.syncUpdates('blockuser', $scope.blockedUsers, function (action) {
      if (action == 'created') {
        if (!isAdmin) {
          for (var i = 0; i < $scope.blockedUsers.length; ++i) {
            if ($scope.blockedUsers[i].email == userEmail) {
              $scope.awesomeChats.length = 0;
              $scope.blocked = true;
              if ($scope.blockedUsers[i].type == 2) {
                $scope.blockedPerm = true;
              }
              //socket.unsyncUpdates('chatmessage');
              $http.get('/api/chatarchives/' + $scope.blockedUsers[i].message).success(function (msg) {
                for (var j = 0; j < $scope.blockedUsers.length; ++j) {
                  if ($scope.blockedMessages['id'] == msg._id) {
                    $scope.blockedMessages.splice(j, 1);
                  }
                  $scope.blockedMessages.push({id: msg._id, name: msg.name, message: msg.message});
                }
              });
            }
          }
        }
      }
    });

    //Listen for Chatrooms
    socket.syncUpdates('chatrooms', $scope.tabs, function (action, room) {
      if (action === 'created') {
        //If more than three Rooms Create Dropdown Array
        if ($scope.tabs.length == 3 && $scope.moreTabs.length == 0) {
          $scope.moreTabs.push(room);
          $scope.tabs.splice(-1, 1);
          $scope.roomNameMore = room.name;
        } else if ($scope.moreTabs.length > 0) {
          $scope.tabs.roomNameMore = "More";
          $scope.moreTabs.push(room);
          $scope.tabs.splice(-1, 1);
        }
      } else if (action === 'deleted') {
        for (var j = 0; j < $scope.tabs.length; ++j) {
          if ($scope.tabs[j]['_id'] === room['_id']) {
            $scope.tabs.splice(j, 1);
          }
        }
        for (var j = 0; j < $scope.moreTabs.length; ++j) {
          if ($scope.moreTabs[j]['_id'] === room['_id']) {
            $scope.moreTabs.splice(j, 1);
          }
        }
      }
    });

    //Tracks chat frequency
    var chatsCounter = 0;
    var inCooldown = false;

    var canChat = function () {
      //If the chat is not in cooldown, start one.
      if (!inCooldown) {
        $timeout(function () {
          //After a second, reset chat counter and take off cooldown
          chatsCounter = 0;
          inCooldown = false;
        }, 3000);
        //Add the chat and let it happen
        chatsCounter++;
        inCooldown = true;
        return true;
      }
      else {
        //User has chatted recently. Check for spammer
        if (chatsCounter < 6) {
          //Let chat happen
          chatsCounter++;
          return true;
        }
        else {
          //Too fast - restrict
          return false;
        }
      }
    };
    //Push New chatmessages
    $scope.addChat = function () {
      if (!$scope.blocked) {
        if ($scope.newChat === '' || typeof  $scope.newChat === 'undefined') {
          return;
        }
        if (canChat()) {
          userSent = !Auth.isAdmin();
          var newMessage = {
            email: userEmail,
            name: userName,
            message: $scope.newChat,
            sentByUser: userSent,
            roomID: $scope.roomID,
            awardedFrom: 'message',
            points: 1,
            userID: $scope.currentUser._id
          };
          /*Save chatmessages for archive : Once Message saved in chatarchive, Omnipoints inserted in omnipoints collection
           and then message will save in chatmessages temporarily and then user's omnipoints will be updated*/
          $http.post('/api/chatarchives', newMessage);
        }
        else {
          return;
        }
      }
      $scope.newChat = '';
    };

    $scope.$on('$destroy', function () {
      if (!(/^\/account\/(?:([^\/]+))\/(?:([^\/]+))\/(?:([^\/]+))$/.test($location.path())) && $location.path() != "/settings" && $location.path() != "/admin" && $location.path() != "/teacher") {
        socket.unsyncUpdates('chatmessage');
        socket.unsyncUpdates('blockuser');
        socket.unsyncUpdates('exam');
      }
    });

    //Switch room on tab click
    $scope.selectRoom = function (room) {
      $scope.roomID = room._id;
      $scope.roomName = room.name;
      $scope.roomType = room.roomType;
    };

    //Switch room on tab click
    $scope.selectMoreRoom = function (room) {
      $scope.roomID = room._id;
      $scope.roomName = room.name;
      $scope.roomNameMore = room.name;
      $scope.roomType = room.roomType;
      $rootScope.earlierRoom = room;
    };

    //Switch to earlier room on tab click
    $scope.selectEarlierRoom = function (room) {
      if ($rootScope.earlierRoom != null) {
        room = $rootScope.earlierRoom;
        $scope.roomID = room._id;
        $scope.roomName = room.name;
        $scope.roomNameMore = room.name;
        $scope.roomType = room.roomType;
      } else {
        $scope.selectMoreRoom($scope.moreTabs[0]);
      }
    };

    //Block user for a session
    $scope.blockUser = function (email) {
      $scope.sessionBlockedUsers.push(email);
      $cookieStore.put('sessionBlockedUsers', $scope.sessionBlockedUsers);
    };


    //Up Vote
    $scope.upVote = function (chat) {
      var points = 10;
      var upvote = true;
      if (chat.upvoted || chat.downvoted) {
        upvote = false;
      }
      for (var i = 0; i < $scope.awesomeChats.length; ++i) {
        if ($scope.awesomeChats[i].email == chat.email && chat._id == $scope.awesomeChats[i]._id) {
          $scope.awesomeChats[i].downvoted = false;
          $scope.awesomeChats[i].upvoted = upvote;
        }
      }

      //insert Omnipoints in omnipoints Collection & Omnipoints in users Collection
      $http.post('/api/omnipoints/', {
          chatId: chat._id,
          email: chat.email,
          points: points,
          awardedFrom: 'upvote',
          downvoted: chat.downvoted
        }
      );
    };

    //Down Vote
    $scope.downVote = function (chat) {
      var points = -10;
      var downvote = true;
      if (chat.downvoted || chat.upvoted) {
        downvote = false;
      }
      for (var i = 0; i < $scope.awesomeChats.length; ++i) {
        if ($scope.awesomeChats[i].email == chat.email && chat._id == $scope.awesomeChats[i]._id) {
          $scope.awesomeChats[i].upvoted = false;
          $scope.awesomeChats[i].downvoted = downvote;
        }
      }
      //insert Omnipoints in omnipoints Collection &  Omnipoints in users Collection
      $http.post('/api/omnipoints/', {
        chatId: chat._id,
        email: chat.email,
        points: points,
        awardedFrom: 'downvote',
        type: 1,
        message: chat.archive_id,
        name: chat.name
      });
    };

    $scope.showVotingMenu = function (chatMessage) {
      return chatMessage.isHover = !chatMessage.isHover;
    };

    //Check if current chat loop to be blocked
    $scope.isBlocked = function (email) {
      for (var i = 0; i < $scope.blockedUsers.length; ++i) if ($scope.blockedUsers[i].email == email) {
        return true;
      }
      return $scope.sessionBlockedUsers.indexOf(email) > -1;
    };
    //Show Up Voting Button
    $scope.showUpVote = function (chat) {
      if (chat.hasOwnProperty('votes')) {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser) && typeof chat.votes[$scope.currentUser['_id']] !== 'undefined');
      } else {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser));
      }
    };

    //is Up Vote picked
    $scope.upVotePicked = function (chat) {
      if (chat.hasOwnProperty('votes')) {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser) && typeof chat.votes[$scope.currentUser['_id']] !== 'undefined' && chat.votes[$scope.currentUser['_id']] !== 'upvote');
      } else {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser));
      }
    };

    //Show Down Voting Button
    $scope.showDownVote = function (chat) {
      if (chat.hasOwnProperty('votes')) {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser) && typeof chat.votes[$scope.currentUser['_id']] !== 'undefined');
      } else {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser));
      }
    };

    //is Down Vote picked
    $scope.downVotePicked = function (chat) {
      if (chat.hasOwnProperty('votes')) {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser) && typeof chat.votes[$scope.currentUser['_id']] !== 'undefined' && chat.votes[$scope.currentUser['_id']] !== 'downvote');
      } else {
        return !!(chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser));
      }
    };

    //Show Ban Button
    $scope.showBan = function (chat) {
      return chat['isHover'] && ($scope.currentUser['email'] != chat.email && chat.sentByUser);
    };

    //Show Chats
    $scope.showChats = function (chat) {
      return ($scope.roomID === chat.roomID && (!$scope.isBlocked(chat.email)) && (($scope.roomType !== 'premium' && $scope.currentUser.role != 'user') || ($scope.roomType == 'premium' && $scope.currentUser.role != 'user') || ($scope.roomType == 'free') )) || chat.notification;
    };

    //Return Chat User
    $scope.chatUser = function (chat) {
      var invalidOmnipoints = (function () {
        return ((typeof chat.omnipoints === 'undefined') || (chat.omnipoints === 0));
      })();
      if ($scope.currentUser['email'] === chat.email) {
        if (chat.sentByUser) {
          if (invalidOmnipoints) {
            return 'Me';
          }
          return 'Me (' + (chat.omnipoints) + ')';
        } else {
          return 'Me';
        }
      } else {
        if (chat.sentByUser) {
          if ((chat.name.split(' ').length > 1)) {
            if (invalidOmnipoints) {
              return chat.name.split(' ')[0] + ' ' + chat.name.split(' ')[1].substr(0, 1) + '.';
            }
            return chat.name.split(' ')[0] + ' ' + chat.name.split(' ')[1].substr(0, 1) + '. (' + (chat.omnipoints) + ')';
          } else {
            if (invalidOmnipoints) {
              return chat.name;
            }
            return chat.name + ' (' + (chat.omnipoints) + ')';
          }
        } else {
          if (chat.name.split(' ').length > 1) {
            return chat.name.split(' ')[0] + ' ' + chat.name.split(' ')[1].substr(0, 1) + '.'
          } else {
            return chat.name;
          }
        }
      }
    };

    //Return Chat User for Message pop
    $scope.popChatUser = function (chat) {
      if ($scope.currentUser['email'] === chat.email) {
        if (chat.sentByUser) {
          return 'Me';
        }
      } else {
        if (chat.sentByUser) {
          if ((chat.name.split(' ').length > 1)) {
            return chat.name.split(' ')[0] + ' ' + chat.name.split(' ')[1].substr(0, 1) + '. ';
          } else {
            return chat.name + ' ';
          }
        } else {
          if (chat.name.split(' ').length > 1) {
            return chat.name.split(' ')[0] + ' ' + chat.name.split(' ')[1].substr(0, 1) + '.'
          } else {
            return chat.name;
          }
        }
      }
    };

    //Return Chat Message
    $scope.chatMessage = function (chat) {
      return $scope.currentUser.role === 'user' ? $scope.freeUserMsg : chat.message;
    };

    $scope.upVotes = function (chat) {
      return ($scope.roomID === chat.roomID && (!$scope.isBlocked(chat.email)) && ($scope.currentUser['email'] != chat.email));
    };
    $scope.showAdminChat = function () {
      return $scope.roomType === 'premium' && $scope.currentUser.role === 'user';
    };
    $scope.hideChatBox = function () {
      return $scope.tabs.length <= 0 || $scope.showChatBox == false;
    };
    $scope.hideNewChats = function () {
      return $scope.tabs.length <= 0 || $scope.roomType == 'premium' && $scope.currentUser.role === 'user' || $scope.blocked;
    };

    $scope.chatboxIsVisible = function () {
      return typeof $cookieStore.get('chatVisible') != 'undefined' ? !!$cookieStore.get('chatVisible') : false;
    };

    $scope.setChatBoxInvisible = function () {
      $cookieStore.put('chatVisible', false);
    };
    $scope.setChatBoxVisible = function () {
      $cookieStore.put('chatVisible', true);
    };

    $scope.userScrolled = function (room) {
      if ($rootScope.scrolledRooms.indexOf(room) < 0) {
        $rootScope.scrolledRooms.push(room);
      }
    };

    /*Wish Good Luck*/
    $scope.wishGoodLuck = function (notification) {
      //send good luck wish
      $http.post('/api/exams/wish-goodluck', {
        data: {
          to: notification.user._id,
          exam: notification.exam
        }
      }).success(function (resp) {
        for (var i = 0; i < $scope.awesomeChats.length; ++i) {
          if (notification._id === $scope.awesomeChats[i]._id) {
            $scope.awesomeChats[i].wished = true;
            (function (chat) {
              $timeout(function () {
                for (var i = 0; i < $scope.awesomeChats.length; ++i) {
                  if (chat._id === $scope.awesomeChats[i]._id) {
                    $scope.awesomeChats.splice(i, 1);
                  }
                }
              }, 3000);
            })(notification)
          }
        }
      });
    };

    //Abbreviate numbers
    var abbreviateNumber = function (value) {
      var newValue = value;
      if (value >= 1000) {
        var suffixes = ["", "K", "M", "B", "T"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum) ) : value).toPrecision(precision));
          var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
          if (dotLessShortValue.length <= 2) {
            break;
          }
        }
        if (shortValue % 1 != 0)  var shortNum = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
      }
      return newValue;
    };
  });
