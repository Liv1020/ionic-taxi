angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope) {
  var map = new BMap.Map("map-container");
  var myPointMarker = null;

  var onSuccess = function(position) {
    setUserGpsMark(position.coords.longitude, position.coords.latitude);
  };

  var setUserGpsMark = function(lng, lat){
    var gpsPoint = new BMap.Point(lng, lat);
    var convertor = new BMap.Convertor();
    convertor.translate([gpsPoint], 1, 5, function(data){
      if(data.status === 0) {
        if(myPointMarker){
          map.removeOverlay(myPointMarker);
        }

        var point = data.points[0];
        map.centerAndZoom(point, 18);
        var marker = new BMap.Marker(point);
        map.addOverlay(marker);
        myPointMarker = marker;
      }
    })
  };

  function onError(error) {
    $rootScope.quickNotify('code: ' + error.code + 'message: ' + error.message + '\n');
  }

  navigator.geolocation.watchPosition(onSuccess, onError);
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
