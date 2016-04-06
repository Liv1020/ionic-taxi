angular.module('starter.services', [])

.config(function(){
  AV.initialize('VI3rH4c7sRo6B2klVgBbxEnv-gzGzoHsz', '76njleOWOsvGuoK0SAmihALq');
})

.factory('Config', function(){
  return {
    appId: 'VI3rH4c7sRo6B2klVgBbxEnv-gzGzoHsz',
    appKey: '76njleOWOsvGuoK0SAmihALq',
    bdMapAk: 'FpKZ2SwqtWLbcDsko96GGVZuUSZfL8ZE',
    bdMapApi: {
      place: 'http://api.map.baidu.com/place/v2/search',
      geocoder: 'http://api.map.baidu.com/geocoder/v2/'
    }
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

.factory('User', function($q, Map, LocalStorage) {
  var coords = {};
  var bd09Point = {};
  var bd09Location = {};
  var myPointMarker = null;

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
    },
    setCoords: function(obj){
      coords = obj;
    },
    getCoords: function(){
      return coords;
    },
    getBd09Point: function(){
      return bd09Point;
    },
    getBd09Location: function(){
      return bd09Location;
    },
    setMarkerToBaiduMap: function(map){
      Map.gpsToBd09(coords.longitude, coords.latitude).then(function(point){
        bd09Point = point;
        if(myPointMarker){
          map.removeOverlay(myPointMarker);
        }else{
          map.centerAndZoom(bd09Point, 18);
        }
        var marker = new BMap.Marker(bd09Point);
        map.addOverlay(marker);
        myPointMarker = marker;
      });
    },
    getUserPlaces: function(){
      return LocalStorage.getObject('user.search', []);
    },
    addUserPlace: function(place){
      var data = LocalStorage.getObject('user.search', []);
      var valid = true;
      data.forEach(function(value, index){
        if(value.uid == place.uid){
          valid = false;
        }
      });
      if(valid){
        data.push(place);
        LocalStorage.setObject('user.search', data.reverse());
      }
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

.factory('Travel', function(User, $q){
  var Order = AV.Object.extend('Post');
  var userOrder = null;

  return {
    has: function(){
      return userOrder ? true: false;
    },
    get: function(){
      if(!userOrder){
        userOrder = new Order();
      }
      return userOrder;
    },
    create: function(order){
      var defer = $q.defer();

      if(!order.to.name){
        defer.reject({
          code: 601,
          message: '目的地不能为空'
        });
        return defer.promise;
      }

      userOrder = new Order();
      userOrder.set('to', order.to);
      userOrder.set('from', order.from);
      userOrder.set('price', order.price);
      //userOrder.set('orderAt', new Date().toLocaleDateString());
      userOrder.set('user', User.current());
      userOrder.save().then(function(data) {
        defer.resolve(data);
      }, function(err) {
        defer.reject(err);
      });

      return defer.promise;
    }
  };
})

.factory('Map', function($http, Config, $q){
  return {
    createMap: function(id){
      var map = new BMap.Map(id, {enableHighResolution: true});
      map.disableDoubleClickZoom();
      return map;
    },
    /**
     *
     * @param query
     * @param region
     * @returns {HttpPromise}
     */
    getPlaces: function(query, region){
      return $http.get(Config.bdMapApi.place, {params:{query: query, scope: 1, region: region, output: 'json', ak: Config.bdMapAk}});
    },
    getLocation: function(lng, lat){
      return $http.get(Config.bdMapApi.geocoder, {params:{location: lat + ',' +lng, pois: 0, output: 'json', ak: Config.bdMapAk}});
    },
    gpsToBd09: function(longitude, latitude){
      var defer = $q.defer();
      var gpsPoint = new BMap.Point(longitude, latitude);
      var convertor = new BMap.Convertor();
      convertor.translate([gpsPoint], 1, 5, function(data){
        if(data.status === 0) {
          var point = data.points[0];
          defer.resolve(point);
        }else{
          defer.reject({
            code: -1,
            message: '转换失败'
          });
        }
      });

      return defer.promise;
    }
  }
})

.factory('LocalStorage', function($window) {
  var getPrefixKey = function (key) {
    return 'Taxi.local.' + key;
  };

  return {
    set: function(key, value) {
      $window.localStorage[getPrefixKey(key)] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[getPrefixKey(key)] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[getPrefixKey(key)] = JSON.stringify(value);
    },
    getObject: function(key, defaultValue) {
      defaultValue = defaultValue ? defaultValue : {};
      if($window.localStorage[getPrefixKey(key)]){
        var data =  JSON.parse($window.localStorage[getPrefixKey(key)]);
        return angular.extend(data, defaultValue);
      }else{
        return defaultValue;
      }
    }
  }
});
