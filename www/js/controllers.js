angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $ionicPlatform, Map, Travel, User, $ionicHistory) {
  var map = Map.createMap('map-container');
  $scope.user = User;
  $scope.to = '';

  //收听广播
  $rootScope.$on('travel.selected.to', function(e, data){
    $scope.to = data.address;
  });

  $scope.create = function(){
    Travel.create($scope.to).then(function(){
      //不能返回
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $rootScope.goTo('order', {id: '123'}, {}, 'forward');
      $rootScope.quickNotify('我们正在努力帮您寻找司机');
    }, function(error){
      $rootScope.quickNotify(error.message);
    })
  };

  //监听变化
  $scope.$watch('user.getCoords()', function(){
    User.setMarkerToBaiduMap(map);
  });
})

.controller('OrderCtrl', function($scope, Map) {
  var map = Map.createMap('order-map-container');
})

.controller('FindCtrl', function($scope, Chats) {
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

.controller('FindDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $state, $ionicViewService, User, $rootScope) {
  $scope.goLogin = function(){
    if(User.isGuest()){
      $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $state.go('tab.login');
    }
  };

  $scope.user = User.current();

  //如果广播了，更新用户信息
  $rootScope.$on('user.login', function(){
    $scope.user = User.current();
  });
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
    $scope.$emit('user.login');

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

      $scope.$emit('user.login');

      $state.go('tab.account');
    }, function(error){
      $rootScope.quickNotify(error.message);
    });
  }
})

.controller('SearchCtrl', function($scope, $rootScope, Map) {
  $scope.items = [];
  $scope.search = function(){
    Map.getPlaces().then(function(result){
      if(result.status == 0){
        $scope.items = result.result;
      }
    }, function(){
      $rootScope.quickNotify('搜索失败');
    });
  };

  $scope.selected = function(address){
    $scope.$emit('travel.selected.to', {address: address});
    $rootScope.goBack();
  }
});
