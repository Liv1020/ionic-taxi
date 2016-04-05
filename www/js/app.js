// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $ionicLoading, $window, $ionicViewSwitcher, $ionicHistory, $state, User) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    navigator.geolocation.watchPosition(function(position) {
      User.setCoords(position.coords);
      $rootScope.$broadcast('user.changeLocation');
    }, function(error) {
      $rootScope.quickNotify('code: ' + error.code + 'message: ' + error.message + '\n');
    });
  });

  /**
   * 显示信息
   * @param text
   */
  $rootScope.show = function(text) {
    $rootScope.loading = $ionicLoading.show({
      template: text ? text : 'Loading...',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 500,
      showDelay: 0
    });
  };

  /**
   * 隐藏信息
   */
  $rootScope.hide = function() {
    $ionicLoading.hide();
  };

  /**
   * 长提示
   * @param text
   */
  $rootScope.longNotify = function(text) {
    $rootScope.show(text);
    $window.setTimeout(function() {
      $rootScope.hide();
    }, 2999);
  };

  /**
   * 短提示
   * @param text
   */
  $rootScope.quickNotify = function(text) {
    $rootScope.show(text);
    $window.setTimeout(function() {
      $rootScope.hide();
    }, 999);
  };

  /**
   * 动画跳转
   * @param name
   * @param params
   * @param options
   * @param direction
   */
  $rootScope.goTo = function(name, params, options, direction) {
    direction && $ionicViewSwitcher.nextDirection(direction);
    $state.go(name, params, options);
  };

  /**
   * 动画返回
   */
  $rootScope.goBack = function() {
    $ionicViewSwitcher.nextDirection('back');
    $ionicHistory.goBack();
  };
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('order', {
    url: '/order/:id',
    templateUrl: 'templates/order.html',
    controller: 'OrderCtrl'
  })

  .state('tab.find', {
    url: '/find',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-find.html',
        controller: 'FindCtrl'
      }
    }
  })

  .state('tab.find-detail', {
    url: '/find/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/find-detail.html',
        controller: 'FindDetailCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.login', {
    url: '/login',
    views: {
      'tab-account': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('search', {
    url: '/search',
    templateUrl: 'templates/search.html',
    controller: 'SearchCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
