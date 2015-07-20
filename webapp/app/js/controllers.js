var tcbernControllers = angular.module('tcbernControllers', ['ui.bootstrap', 'ngAside', 'restangular', 'authentication', 'header', 'hc.marked']);

tcbernControllers.controller('MainCtrl', function($scope, $aside, $state, Restangular, $header) {
    Restangular.setBaseUrl('http://localhost/tcbern/backend/public/api');
    
    $scope.title = $header.title;
    $scope.$watch(
      function() { return $header.title; },
      function(oldValue, newValue) { $scope.title = $header.title; });
    
    $scope.asideState = {
      open: false
    };
    
    $scope.openAside = function() {
      $scope.asideState = {
        open: true,
      };
      
      function postClose() {
        $scope.asideState.open = false;
      }
      
      $aside.open({
        templateUrl: 'partials/menu.html',
        placement: 'left',
        size: 'sm',
        animation: true,
        controller: function($scope, $modalInstance, $authentication, $filter) {
          $scope.menuElementList = [
            {'route': 'infos', 'html': 'News', 'requiresAuthentication': false},
            {'route': 'committee', 'html': 'Committee', 'requiresAuthentication': false},
            {'route': 'identities', 'html': 'Members', 'requiresAuthentication': true},
            {'route': 'login', 'html': 'Login', 'requiresAuthentication': false}
          ];
          
          $scope.checkAuthorization = function(value, index) {
            if ($authentication.isAuthenticated) return true;
            else return value.requiresAuthentication == false;
          };
          
          $scope.go = function(e, element) {
            $modalInstance.dismiss();
            e.stopPropagation();
            $state.go(element.route);
          }
        }
      }).result.then(postClose, postClose);
    }
  });
  
tcbernControllers.controller('InfosCtrl', function ($scope, Restangular, $header) {
  $header.title = 'News';
  
  var infos = Restangular.all('infos');
  infos.getList().then(function(allInfos) {
    $scope.infosList = allInfos;
  });
  
  $scope.getInfoById = function(id) {
    for (i = 0; i < $scope.infosList.length; i++) {
      if ($scope.infosList[i].id == id) {
        return $scope.infosList[i];
      }
    }
    
    return {};
  };
});
tcbernControllers.controller('InfosDetailCtrl', function ($scope, $stateParams, Restangular, $header, marked) {
  $header.title = 'Detail';
  
  Restangular.one('infos', $stateParams.id).get().then(function(info) {
    $header.title = info.title;
    $scope.detail = info;
  });
});
tcbernControllers.controller('IdentitiesCtrl', function ($scope, $state, Restangular, $header) {
  $header.title = 'Members';
  
  var identities = Restangular.all('identities');
  identities.getList().then(function(allIdentities) {
    $scope.identityList = allIdentities;
  });
  
  $scope.go = function(event, identity) {
    event.stopPropagation();
    $state.go('identity_detail', { 'id': identity.id });
  };
});
tcbernControllers.controller('IdentityDetailCtrl', function ($scope, $stateParams, Restangular, $header) {
  $header.title = 'Member';
  
  Restangular.one('identities', $stateParams.id).get().then(function(identity) {
    $header.title = identity.lastname + ' ' + identity.firstname;
    $scope.identity = identity;
  });
});
tcbernControllers.controller('CommitteeCtrl', function ($scope, $stateParams, Restangular, $header) {
  $header.title = 'Committee';
  
  Restangular.all('committee').getList().then(function(allCommitteeMembers) {
    $scope.committeeMemberList = allCommitteeMembers;
  });
});

tcbernControllers.controller('LoginCtrl', function ($scope, $authentication, $header) {
  $header.title = 'Login';
  
  $scope.username = '';
  $scope.password = '';
  $scope.message = '';
  
  $scope.resetInfosWithMessage = function(reset, message) {
    if (reset) {
      $scope.username = '';
      $scope.password = '';
    }
    $scope.message = message;
  };
  $scope.login = function() {
    $authentication.authenticate($scope.username, $scope.password, function(data, status, header, config) {
        $scope.resetInfosWithMessage(true, 'Successfuly authenticated');
      },
      function(data, status, header, config) {
        if (status == 503) {
          $scope.resetInfosWithMessage(false, 'Username or password invalid');
        } else {
          $scope.resetInfosWithMessage(false, 'Problem during authentication: status = ' + status);
        }
      });
    $authentication.isAuthenticated = true;
  };
});