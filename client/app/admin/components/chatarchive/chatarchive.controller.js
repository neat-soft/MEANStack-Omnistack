'use strict';

angular.module('fsaApp')
  .controller('ChatarchiveCtrl', function ($scope, $http, socket, Auth, $window) {
    $scope.glued = true;
    $scope.tabs = [];
    $scope.page = {};
    $scope.limit = 30;
    $scope.archiveChats = [];
    $scope.currentUser = Auth.getCurrentUser();
    $scope.roomsInitialLoaded = []; //Array to save which rooms have initially loaded with chat messages
    $scope.blockedUsers = [];
    $scope.blockedMessages = [];


    // Fetch All Rooms and create Tabs
    $http.get('/api/chatrooms').success(function (rooms) {
      if (rooms.length) {
        $scope.tabs = rooms;
        $scope.roomID = $scope.tabs[0]['_id'];
        $scope.roomName = $scope.tabs[0]['name'];
        $scope.roomType = $scope.tabs[0]['roomType'];
        for (var i = 0; i < rooms.length; ++i) {
          //Initialize Pagination For Each Room
          $scope.page[rooms[i]['_id']] = {};
          $scope.page[rooms[i]['_id']].pagecount = 1;
          $scope.page[rooms[i]['_id']].msgcount = 0;
          $scope.page[rooms[i]['_id']].totalMsgcount = 0;
        }
        socket.syncUpdates('chatarchive', $scope.archiveChats, function (action, message) {
          ++$scope.page[message.roomID].msgcount;
        });

        //Get Blocked Users
        $http.get('/api/blockusers').success(function (users) {
          $scope.blockedUsers = users;
        });
      }
    });

    //Listen for Chatrooms
    socket.syncUpdates('chatrooms', $scope.tabs, function (action, room) {
      //If New room is created
      if (action === 'created') {
        var found = 0;
        for (var i = 0; i < $scope.tabs.length; ++i) {
          if ($scope.tabs[i]['_id'] === room['_id']) {
            ++found;
          }
        }
        if (!found) {
          //Initialize Pagination For Newly Added Room
          $scope.tabs.push(room);
          $scope.page[room['_id']] = {};
          $scope.page[room['_id']].pagecount = 1;
          $scope.page[room['_id']].msgcount = 0;
          $scope.page[room['_id']].totalMsgcount = 0;
        }
      }
      //If room is Deleted
      else if (action === 'deleted') {
        for (var j = 0; j < $scope.tabs.length; ++j) {
          if ($scope.tabs[j]['_id'] === room['_id']) {
            $scope.tabs.splice(j, 1);
          }
        }
        //Remove Pagination
        delete  $scope.page[room['_id']];
      }
    });


    //Switch room on tab click
    $scope.selectRoom = function (room) {
      $scope.roomID = room._id;
      $scope.roomName = room.name;
      $scope.roomType = room.roomType;

      //check if current room is loaded with chat messages; if not load chat messages
      if ($scope.roomsInitialLoaded.indexOf($scope.roomID) < 0) {
        $scope.loadChats();
      }
    };


    $scope.loadChats = function () {
      // Fetch All Chats for current room
      $http.get('/api/chatarchives/' + $scope.roomID + '/' + $scope.page[$scope.roomID].pagecount + '/' + $scope.limit).success(function (chatmsg) {
        var chatmessage = chatmsg.messages;
        $scope.page[$scope.roomID].msgcount = chatmsg.messages.length;
        $scope.page[$scope.roomID].totalMsgcount = chatmsg.count;
        if (chatmessage.length > 0) {
          for (var i = chatmessage.length - 1; i >= 0; --i) {
            $scope.archiveChats.unshift(chatmessage[i]);
            if ($scope.roomsInitialLoaded.indexOf(chatmessage[i].roomID) < 0) {
              //Add room Id in Initially loaded rooms list
              $scope.roomsInitialLoaded.push(chatmessage[i].roomID);
            }
          }
        }
        var scrollLoop = setInterval(function () {
          var scroller = angular.element('[scrollable=true]');
          scroller.each(function (a, b) {
            if (b.scrollHeight > 0) {
              b.scrollTop = b.scrollHeight;
              clearInterval(scrollLoop);
            }
          });
        }, 200);
      });
    };

    //Load Earlier Messages
    $scope.loadEarlierMessages = function () {
      ++$scope.page[$scope.roomID].pagecount;
      $scope.loadChats();
    };

    //Export To Json
    $scope.exportToJson = function () {
      $http.get('/api/chatarchives/export/chats').success(function (resp) {
        $window.open('/api/chatarchives/download/chats/file/' + resp.fileName);
      });
    };


    //Block user
    $scope.blockUser = function (email, type, message, name) {
      var blockUser = {email: email, type: type, message: message, name: name, timestamp: Date.now()};
      $http.post('/api/blockusers/', blockUser);
    };


    socket.syncUpdates('blockuser', $scope.blockedUsers, function (action, a) {
      if (action == 'deleted') {
        for (var i = 0; i < $scope.blockedUsers.length; ++i) {
          if ($scope.blockedUsers[i]['_id'] == a._id) {
            $scope.blockedUsers.splice(i, 1);
          }
        }
      } else if (action == 'created') {
        for (var j = 0; j < $scope.blockedUsers.length; ++j) {
          if ($scope.blockedUsers[j]['_id'] == a._id) {
            $scope.blockedUsers.splice(j, 1);
          }
        }
        $scope.blockedUsers.push(a);
      }
    });

    //Check if current chat loop to be blocked
    $scope.isBlocked = function (email) {
      for (var i = 0; i < $scope.blockedUsers.length; ++i) if ($scope.blockedUsers[i].email == email) {
        return true;
      }
      return false;
    }

  });
