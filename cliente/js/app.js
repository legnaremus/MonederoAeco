var app = angular.module("monedero",['controllers','services','ngRoute']);


app.config(function($routeProvider){

	$routeProvider.when('/',{
		controller: 'mainCtrl',
		templateUrl: 'templates/login.html'
	})
	$routeProvider.when('/home',{
		controller: 'homeCtrl',
		templateUrl: 'templates/home.html'
	})
	$routeProvider.when('/altas',{
		controller: 'altasCtrl',
		templateUrl: 'templates/altas.html'
	})
	$routeProvider.when('/bajas',{
		controller: 'bajasCtrl',
		templateUrl: 'templates/bajas.html'
	})
	$routeProvider.when('/registros',{
		controller: 'registrosCtrl',
		templateUrl: 'templates/registros.html'
	})
	$routeProvider.when('/usuarios',{
		controller: 'usuariosCtrl',
		templateUrl: 'templates/usuarios.html'
	})
	$routeProvider.when('/sucursales',{
		controller: 'sucursalesCtrl',
		templateUrl: 'templates/sucursales.html'
	})
	$routeProvider.when('/promociones',{
		controller: 'promocionesCtrl',
		templateUrl: 'templates/promociones.html'
	})
	$routeProvider.when('/configuraciones',{
		controller: 'promocionesCtrl',
		templateUrl: 'templates/configuraciones.html'
	})
	.otherwise('/');
});