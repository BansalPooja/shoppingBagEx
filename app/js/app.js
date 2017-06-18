(function () {

'use strict';


  angular.module('shoppingbagex', ['ngRoute', 'ngAnimate','ngMaterial'])

  .config([
    '$locationProvider',
    '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
        .when("/", {
          templateUrl: "./partials/partial1.html",
          controller: "MainController"
        })
        .otherwise({
           redirectTo: '/'
        });
    }
  ]);

  //Load controller
  angular.module('shoppingbagex').controller('MainController', [
    '$scope', '$http',
    function($scope, $http) {
        $scope.cartItems ={};
        $http.get('/assets/cart.json').then(function (response){
            $scope.cartItems = response.data;
        });

    }
  ]);

}());