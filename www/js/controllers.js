angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $ionicPlatform) {
  var map = new BMap.Map("map-container");
  var myPointMarker = null;

  var setUserGpsMark = function(lng, lat){
    var gpsPoint = new BMap.Point(lng, lat);
    var convertor = new BMap.Convertor();
    convertor.translate([gpsPoint], 1, 5, function(data){
      if(data.status === 0) {
        var point = data.points[0];
        if(myPointMarker){
          map.removeOverlay(myPointMarker);
        }else{
          map.centerAndZoom(point, 18);
        }
        var marker = new BMap.Marker(point);
        map.addOverlay(marker);
        myPointMarker = marker;
      }
    })
  };

  $ionicPlatform.ready(function() {
    navigator.geolocation.watchPosition(function(position) {
      setUserGpsMark(position.coords.longitude, position.coords.latitude);
    }, function(error) {
      $rootScope.quickNotify('code: ' + error.code + 'message: ' + error.message + '\n');
    });
  });
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

.controller('AccountCtrl', function($scope, $state, $ionicViewService, User) {
  $scope.goLogin = function(){
    if(User.isGuest()){
      $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $state.go('tab.login');
    }
  };

  $scope.settings = {
    enableFriends: true
  };
})

.controller('LoginCtrl', function($scope, $rootScope, $ionicViewService, $state, User, $interval) {
  $scope.form = {
    mobile: '',
    code: ''
  };

  $scope.sms = {
    disabled: false,
    content: '发送验证码'
  };

  var configSecond = 10;
  var second = configSecond;

  var resetSms = function(){
    second = configSecond;
    $scope.sms.disabled = false;
    $scope.sms.content = '发送验证码';
  };

  $scope.sendSmsCode = function(e){
    if($scope.sms.disabled){
      return;
    }

    User.sendSmsCode($scope.form.mobile).then(function(){
      $scope.sms.disabled = true;
      $interval(function(){
        --second;
        $scope.sms.content = second + '秒后重新发送';
        if(second == 0){
          resetSms();
        }
      }, 1000, configSecond);
    }, function(error){
      $rootScope.quickNotify(error.message);
    });
  };

  $scope.login = function(){
    User.login($scope.form.mobile, $scope.form.code).then(function(){
      //控制你按下返回键时，跳转到原来的页面  这对Login页面不好 当然是随你了
      $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $state.go('tab.account');
    }, function(error){
      $rootScope.quickNotify(error.message);
    });
  }
});
