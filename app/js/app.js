(function() {

    'use strict';

    var app = angular.module('shoppingbagex', ['ngRoute', 'ngAnimate', 'ngMaterial']);

    app.config([
        '$locationProvider',
        '$routeProvider',
        function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');
            // routes
            $routeProvider
                .when("/", {
                    templateUrl: "./partials/shoppingBag.html",
                    controller: "MainController"
                })
                .otherwise({
                    redirectTo: '/'
                });
        }
    ]);

    //Load controller
    app.factory('cartProducts', function() {
        var bag = {};
        bag.items = [];
        var service = {
            get bag() {
                return bag;
            }
        }
        return service;
    })
    app.factory('createInvoice', function(cartProducts) {
        var createInvoice = {};
        createInvoice.invoiceData = {};
        createInvoice.calculateInvoice = function() {

            var discountRate = 0;

            //calculate subtotal
            var subtotal = 0;
            var currency;
            var itemCount = 0;
            var p_subtotal = cartProducts.bag.items.map(function(product) {
                    var price = product.p_quantity * product.p_price;
                    subtotal = subtotal + price;
                    currency = product.c_currency;
                    itemCount = itemCount + product.p_quantity;
                    return subtotal;
                })
                //Discount Logic
            if (itemCount == 3) {
                discountRate = 0.05;
            } else if (itemCount > 3 && itemCount < 6) {
                discountRate = 0.10;
            } else if (itemCount > 10) {
                discountRate = 0.25;
            }

            var estimated_total = subtotal - subtotal * discountRate;
            createInvoice.invoiceData.subtotal = subtotal;
            createInvoice.invoiceData.discount = subtotal * discountRate;
            createInvoice.invoiceData.total = estimated_total;
            createInvoice.invoiceData.discountRate = discountRate * 100;
            createInvoice.invoiceData.currency = currency;
            createInvoice.invoiceData.count = itemCount;
        }
        return createInvoice;

    });
    app.controller('MainController',
        function($scope, $http, $mdDialog, cartProducts, createInvoice) {
            $scope.cartItems = {};
            $scope.invoice = {};
            $scope.customFullscreen = false;
            $http.get('/assets/cart.json').then(function(response) {
                cartProducts.bag.items = response.data.productsInCart;
                $scope.cartItems.productsInCart = cartProducts.bag.items;
                createInvoice.calculateInvoice();
                $scope.invoice = createInvoice.invoiceData;

            });
            $scope.showEditDialog = function(ev, productDetails) {
                $mdDialog.show({
                        locals: { dataToPass: productDetails },
                        controller: 'DialogController',
                        templateUrl: './partials/editDialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: $scope.customFullscreen
                    })
                    .then(function(answer) {
                        createInvoice.calculateInvoice();
                        $scope.invoice = createInvoice.invoiceData;
                    }, function() {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };
            $scope.removeFromBag = function(ev, productDetails) {
                console.log('object to remove : ', productDetails);
                if (productDetails.p_quantity > 1) {
                    productDetails.p_quantity = productDetails.p_quantity - 1;
                } else {
                    cartProducts.bag.items.splice(cartProducts.bag.items.indexOf(productDetails), 1);
                }
                createInvoice.calculateInvoice();
                $scope.invoice = createInvoice.invoiceData;
            }
        });
    app.controller('DialogController', function($scope, $mdDialog, dataToPass, cartProducts, createInvoice) {
        $scope.productDetails = dataToPass;
        $scope.newProductDetails = {};
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.updateBag = function(ev) {
            //we don't need to perform any additional operations here as dynamic binding take care of data updates in cart.
            if (cartProducts.bag.items.indexOf($scope.productDetails) >= 0) {
                var index = cartProducts.bag.items.indexOf($scope.productDetails);
                if ($scope.productDetails.p_available_options.sizes[cartProducts.bag.items[index].p_selected_size.code.toLowerCase()]) {
                    cartProducts.bag.items[index].p_selected_size.name = $scope.productDetails.p_available_options.sizes.name;
                }
            }
            $scope.hide();
        };
    });

}());