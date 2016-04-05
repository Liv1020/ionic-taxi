angular.module('starter.services', [])

.config(function(){
  AV.initialize('VI3rH4c7sRo6B2klVgBbxEnv-gzGzoHsz', '76njleOWOsvGuoK0SAmihALq');
})

.factory('Config', function(){
  return {
    appId: 'VI3rH4c7sRo6B2klVgBbxEnv-gzGzoHsz',
    appKey: '76njleOWOsvGuoK0SAmihALq'
  };
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('User', function($q) {
  return {
    current: function() {
      return AV.User.current();
    },
    isGuest: function() {
      if(AV.User.current()){
        return false;
      }else{
        return true;
      }
    },
    sendSmsCode: function(mobile){
      var defer = $q.defer();
      if(!mobile){
        defer.reject({
          code: 601,
          message: '手机号码不能为空'
        });
        return defer.promise;
      }

      return AV.Cloud.requestSmsCode(mobile);
    },
    login: function(mobile, code) {
      var defer = $q.defer();
      if(!mobile){
        defer.reject({
          code: 601,
          message: '手机号码不能为空'
        });
        return defer.promise;
      }

      if(!code){
        defer.reject({
          code: 601,
          message: '验证码不能为空'
        });
        return defer.promise;
      }

      var user = new AV.User();
      return user.signUpOrlogInWithMobilePhone({
        mobilePhoneNumber: mobile,
        smsCode: code
      });
    },
    logout: function(){
      AV.User.logOut();
    }
  };
})

.factory('Push', function(Config){
  var push = AV.push({
    appId: Config.appId,
    appKey: Config.appKey
  });

  return {
    send: function(){
      push.send({
        channels: ['call-taxi'],
        data: {alert: '我需要打车'}
      }, function(result) {
        if (result) {
          console.log('推送成功发送');
        } else {
          console.log('error');
        }
      });
    }
  };
})

.factory('Travel', function(){
  var order = null;

  return {
    has: function(){
      return order ? true: false;
    },
    get: function(){
      if(!order){
        order = null;
      }
      return order;
    },
    create: function(){

    }
  };
});
