var app = angular.module("services",[]);

app.service("token",function($window){
	var servicio = this;
	
	servicio.get_token = function(){
		return localStorage.getItem("token_monedero");
	};

	servicio.set_token = function(token){
  		localStorage.setItem("token_monedero", token);

	}

});

app.service("servidor",function($http,token) {
	var servicio = this;
	
	servicio.servidor = "http://localhost:8080";

	servicio.inserta_promocion = function(nombre,descripcion,porcentaje,password,f){
		$http({

	  		method: 'POST',

	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},

		  	url: servicio.servidor + '/promocion/' + nombre + '/' + descripcion + '/' + porcentaje + '/' + password

		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });			
	};

	servicio.inserta_sucursal = function(id_sucursal,nombre_sucursal,direccion_sucursal,password,f){
		$http({

	  		method: 'GET',

	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},

		  	url: servicio.servidor + '/sucursal/' + id_sucursal + '/' + nombre_sucursal + '/' + direccion_sucursal + '/' + password

		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });			
	};

	servicio.get_transacciones = function(f){
		$http({
	  		method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},

		  	url: servicio.servidor + '/transacciones/'

		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });	
	};

	servicio.baja_monedero = function (id_monedero,password,f) {
		$http({
	  		method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},
		  url: servicio.servidor + '/bajamonedero/' + id_monedero + '/' + password

		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });		
	}

	servicio.inserta_persona_monedero = function(persona,f){
		$http({
	  		method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},
		  url: servicio.servidor + '/persona/' + persona.nombre + '/' + persona.apellido_paterno + '/' + persona.apellido_materno + '/' + persona.telefono + '/' + persona.correo + '/' + persona.id_monedero
		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });
	};

	servicio.get_persona_monedero = function(id,f){
		$http({
	  		method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},
		  url: servicio.servidor + '/monedero/' + id
		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });	
	};

	servicio.set_monedero = function(id,monto,f){
		$http({
	  		method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},
		  url: servicio.servidor + '/monedero/' + id + '/' + monto
		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });		
	};

	servicio.get_promociones  =function(f){
		$http({
	  		method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},
		  url: servicio.servidor + '/promocion/'
		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });
	};

	servicio.get_persona = function(f,id_persona){
		console.log(token.get_token());

		id_persona = id_persona || '';
		$http({
	  		method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/x-www-form-urlencoded ',
		   		'Accept':'application/json, text/plain, */*',
		   		'X-Auth-Token': token.get_token()
	 		},
		  url: servicio.servidor + '/persona/' + id_persona
		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });
		
	};

	servicio.login = function(user,password,f){

		$http({
		  method: 'GET',
	   		headers: {
		   		'Content-Type': 'application/json',
		   		'Accept':'application/json, text/plain, */*',
	 		},
		  url: servicio.servidor + '/login/' + user + "/" + password
		}).then(function successCallback(response) {
		    f(response);
		  }, function errorCallback(response) {

		  		f(response);
		  });
	};


});