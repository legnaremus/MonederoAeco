
var app = angular.module("controllers",['ngRoute']);


app.controller('mainCtrl',function($scope,servidor,token,$window){
	$scope.message_error = "";


	$scope.login = function(){
		$scope.error_login = false;
		$scope.message_error = "";

		servidor.login($scope.user,$scope.password,function(response){
			console.log(response);
			switch (response.status){
				case 401:
					$scope.error_login = true;
					$scope.message_error = "Datos incorrectos";
					break;
				case 200:
					token.set_token(response.data);
					$window.location = "#/home";
					break;
			}
		});
	}
});
app.controller('sucursalesCtrl',function($scope,servidor) {
	$scope.sucursal = {};

	$scope.agrega = function () {
		$scope.message_error = null;
		$scope.message_ok = null;

		if (!$scope.sucursal.nombre || !$scope.sucursal.id_sucursal || !$scope.sucursal.direccion || !$scope.sucursal.contrasenia){
			$scope.message_error = 'Rellene todos los campos';
			return;
		}

		servidor.inserta_sucursal($scope.sucursal.id_sucursal,$scope.sucursal.nombre,$scope.sucursal.direccion,$scope.sucursal.contrasenia,function(response){
			switch(response.status){
				case 200:
					$scope.message_ok = 'Sucursal agregada correctamente';
					break;
				case 402:
					$scope.message_error = 'Contraseña incorrecta';
					break;
				case 400:
					$scope.message_error = 'Ya existe un monedero con ese id';
					break;
			}
		});

	};

});

app.controller('promocionesCtrl',function($scope,servidor){

	$scope.agregar = function(){
		$scope.message_error = null;

		if (!$scope.promocion.nombre || !$scope.promocion.porcentaje || !$scope.promocion.contrasenia){
			$scope.message_error = 'Rellene todos los campos';
			return;
		}

		servidor.inserta_promocion($scope.promocion.nombre,$scope.promocion.descripcion,$scope.promocion.porcentaje,$scope.promocion.contrasenia,function(response){
			console.log(response);
			switch(response.status){
				case 200:
					$scope.message_ok = 'Promocion agregada correctamente';
					break;
				case 400:
					$scope.message_error = 'Escriba un porcentaje númerico';
					break;
				case 402:
					$scope.message_error = 'Contraseña incorrecta';
					break;
			}

		});

	};

});

app.controller('usuariosCtrl',function($scope,servidor){

});
app.controller('registrosCtrl',function($scope,servidor) {
	$scope.transacciones = [];

	servidor.get_transacciones(function(response) {
		$scope.transacciones = response.data;
		for (i = 0;i < $scope.transacciones.length;i++){
			var fecha = new Date();
			$scope.transacciones[i].fecha_transaccion= new Date($scope.transacciones[i].fecha_transaccion).toLocaleString()

		}
		console.log(response);
	});

});
app.controller('bajasCtrl',function($scope,servidor){


	$scope.desactivar = function(){
		$scope.message_ok = null;
		$scope.message_error = null;

		if (!$scope.id_monedero || !$scope.contrasenia){
			$scope.message_error = 'Rellene todos los campos';
			return;
		}

		servidor.baja_monedero($scope.id_monedero,$scope.contrasenia,function(response){
			console.log(response);
			switch(response.status){
				case 200:
					$scope.message_ok = "Monedero dado de baja correctamente";
					break;
				case 400:
					$scope.message_error = 'No existe un monedero con el id especificado';
					break;
				case 401:
					$scope.message_error = 'Contraseña incorrecta';
					break;
			}
		});
	}
});

app.controller('altasCtrl',function($scope,servidor){
	$scope.persona = {};

	$scope.activar = function(){
		console.log($scope.persona);
		$scope.message_ok = null;
		$scope.message_error = null;

		servidor.inserta_persona_monedero($scope.persona,function(response){
			console.log(response);
			switch (response.status){
				case 400:
					$scope.message_error  = 'Ya existe un monedero con el id especificado';
					break;
				case 200:
					$scope.message_ok = "Monedero agregado correctamente";
					break;

			}
		});
	};	

});

app.controller('homeCtrl',function($scope,servidor,$window){
	$scope.login_ok = false;
	$scope.monedero = {};

	$scope.promociones = {};
	$scope.promociones.select = -1;
	$scope.promo_seleccionada = {};

	$scope.obten_persona_monedero = function(){
		servidor.get_persona_monedero($scope.monedero.id_monedero,function(response){
			console.log(response);
			$scope.message_error = null;
			$scope.datos_ok = false;
			$scope.message_ok  = null;

			switch(response.status){
				case 200:
					if (response.data.length > 0){
						$scope.nombre = response.data[0].nombre;
						$scope.apellido_pat = response.data[0].apellido_pat;
						$scope.apellido_mat = response.data[0].apellido_mat;
						$scope.monto = response.data[0].monto;
						$scope.datos_ok = true;	
					}
					else{
						$scope.message_error  = 'No existe un monedero con el id especificado';
					}
					break;
			}

		});	
	};

	$scope.limpia_mensaje = function(){
		$scope.message_error = null;
	};
	$scope.obten_promocion = function(){
		for (i = 0; i < $scope.promociones.data.length;i++){
			if ($scope.promociones.data[i].id_promocion == $scope.promociones.select){
				console.log($scope.promociones.data[i].porcentaje);
				$scope.promo_seleccionada = $scope.promociones.data[i];
			}
		}
		$scope.limpia_mensaje();
	};

	$scope.quita = function(){
		$scope.message_ok  = null;
		$scope.message_error = null;

		if (!$scope.datos_ok){
			$scope.message_error = 'Escriba un id de monedero valido';
			return;
		}

		if (!$scope.monedero.monto){
			$scope.message_error = 'Escriba un monto';
			return;
		}

		var nuevo_monto = $scope.monto - $scope.monedero.monto;
		console.log ("nuevo monto: " + nuevo_monto);

		servidor.set_monedero($scope.monedero.id_monedero,nuevo_monto,function(response){
			console.log(response);
			switch(response.status){
				case 200:
					$scope.message_ok = 'Se ha quitado el monto especifado';
					$scope.monto = nuevo_monto;

					break;
			}
		});

	};

	$scope.agrega = function(){
		$scope.message_ok  = null;
		$scope.message_error = null;

		if (!$scope.datos_ok){
			$scope.message_error = 'Escriba un id de monedero valido';
			return;
		}

		if (!$scope.promo_seleccionada.porcentaje ){
			$scope.message_error = 'Seleccione un porcentaje';

			return;
		}
		if (!$scope.monedero.monto){
			$scope.message_error = 'Escriba un monto';
			return;
		}
		var nuevo_monto = $scope.monto + ($scope.monedero.monto * ($scope.promo_seleccionada.porcentaje / 100));
		console.log ("nuevo monto: " + nuevo_monto);

		servidor.set_monedero($scope.monedero.id_monedero,nuevo_monto,function(response){
			console.log(response);
			switch(response.status){
				case 200:
					$scope.message_ok = 'Se ha abonado el monto especifado';
					$scope.monto = nuevo_monto;

					break;
					
			}
		});
	};
	servidor.get_promociones(function(response){
		switch(response.status){
			case 0 || 401:
				$window.location = "#/";
				break;
			case 200:
				$scope.login_ok = true;
				$scope.promociones.data = response.data;
				break;

		}
		console.log(response)
	});



});