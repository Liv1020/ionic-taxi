angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $ionicPlatform, Map, Travel, User, $ionicHistory) {
  var map = Map.createMap('map-container');
  $scope.user = User;
  $scope.order = {to: {name:''}, from: {}, price: 0};

  //收听child广播
  $rootScope.$on('travel.selected.to', function(e, data){
    $scope.order.to = data;
    //删除key
    delete $scope.order.to.$$hashKey;
    $scope.order.from = User.getBd09Point();
  });

  //监听root广播
  $scope.$on('user.changeLocation', function(){
    User.setMarkerToBaiduMap(map);
  });

  $scope.create = function(){
    console.log($scope.order);
    Travel.create($scope.order).then(function(order){
      //不能返回
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $rootScope.goTo('order', {id: order.id}, {reload: true}, 'forward');
      $rootScope.quickNotify('我们正在努力帮您寻找司机');
    }, function(error){
      $rootScope.quickNotify(error.message);
    })
  };
})

.controller('OrderCtrl', function($scope, Map, User, $rootScope) {
  var map = Map.createMap('order-map-container');

  //监听root广播
  $scope.$on('user.changeLocation', function(){
    User.setMarkerToBaiduMap(map);
  });

  $scope.cancel = function(){
    $rootScope.goTo('tab.dash', {}, {reload: true}, 'back');
  }
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

.controller('SearchCtrl', function($scope, $rootScope, Map, User) {
  $scope.items = User.getUserPlaces();
  $scope.form = {place: ''};

  $scope.search = function(){
    Map.getPlaces($scope.form.place, '深圳').success(function(result){
      if(result.status == 0){
        $scope.items = result.results;
      }
    });
  };

  $scope.reset = function(){
    $scope.form.place = '';
    $scope.items = User.getUserPlaces();
  };

  $scope.selected = function(place){
    $scope.$emit('travel.selected.to', place);
    User.addUserPlace(place);
    $scope.reset();
    $rootScope.goBack();
  }
});
