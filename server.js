
  var pg = require('pg');
  var restify = require('restify');


  var server = restify.createServer();

  var conString = "postgres://postgres:samael@localhost:5432/Monedero";

	var client_v;

	var elementos_por_pagina = 150;

  var tiempo_login = 12;

  var llaves = function(){
    var este = this;
    var llaves_arreglo = [];
    este.agregar_llave = function(llave){
      llaves_arreglo.push(llave);
    };
    este.existe_llave  = function(llave){
      for (i = 0; i < llaves_arreglo.length; i++){
        //console.log('comparando ' + llave + ' con ' + llaves_arreglo[i].llave );
        if (llaves_arreglo[i].llave == llave){
          return llaves_arreglo[i];
        }
      }
      return 'null';
    };
    este.borra_llave = function(llave){
      for (i = 0; i < llaves_arreglo.length;i++){
        if (llaves_arreglo[i].llave == llave){
          llaves_arreglo.splice(i,1);
          return;
        }
      }
    }
  };


  var llaves_existentes = new llaves();

function genera_llave()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

	var llave = function(llave,id_usuario,nombre_sucursal,password,id_sucursal){
		var este = this;
		este.llave = llave;
    este.contador = 0;
    este.id_sucursal = id_sucursal;
    este.nombre_sucursal = nombre_sucursal;
    este.password = password;
    este.id_usuario = id_usuario;
		este.intervalo = setInterval(function(){
      console.log("interval " + este.contador  + " " + este.llave);
			este.contador++;
      if (este.contador >= tiempo_login * 60){
        llaves_existentes.borra_llave(este.llave);
        clearInterval(este.intervalo);
      }

		},1000);

    llaves_existentes.agregar_llave(este);
	};


  var data_base = function(){

    var execute_query = function(query,f){
      
       client_v.query(query, function(err, result) {
          console.log(query);
          if(err) {
            console.error('error running query', err);
            f(400);
            return; 
          }else{
            f(result.rows);
          }

        });

    };

    var limpia_query = function(query,campos){
      for (i = 0;i < campos.length;i++){
        query = query.replace("!" +campos[i] + "!","");
      }
      return query;
    };

    var insert_persona_monedero = function(query){

      return function(req,res,next){
          var query_final = "";
          res.setHeader('Access-Control-Allow-Origin','*');

          var llave =  req.headers['x-auth-token'] || '';

          var sucursal = llaves_existentes.existe_llave(llave);

          if (sucursal == null){
              console.log("llave no existe");
              res.send(401,"No autorizado");
              next();
          }else{
            query_final = query;
            //query_final = query.replace('!nombre_sucursal!',nombre_sucursal );

            if (req.params['nombre']){
                query_final = query_final.replace('!nombre!',req.params['nombre']);

            }
            if (req.params['apellido_pat']){
              
                query_final = query_final.replace('!apellido_pat!',req.params['apellido_pat']);
            }

            if (req.params['apellido_mat']){
              
                query_final = query_final.replace('!apellido_mat!',req.params['apellido_mat']);
            }

            if (req.params['telefono']){
              
                query_final = query_final.replace('!telefono!',req.params['telefono']);
            }
            if (req.params['email']){
              
                query_final = query_final.replace('!email!',req.params['email']);
            }

            query_final = limpia_query(query_final,['nombre','apellido_pat','apellido_mat','telefono','email']);
            
            console.log(req.params);

            execute_query(query_final,function(todos){
              console.log(todos);

              var id_persona = todos[0].id_persona;

              var query2 = 'INSERT INTO "Monedero"(id_monedero,id_persona_cliente, fecha_activacion, id_sucursal, monto) VALUES (!id_monedero!,!id_persona!,'   + "'" +  new Date()+ "'"  +', !id_sucursal!, 0 )';
              query2 = query2.replace('!id_persona!',id_persona);
              query2 = query2.replace('!id_sucursal!',sucursal.id_sucursal);
              query2 = query2.replace('!id_monedero!', req.params['id_monedero']);
              
              execute_query(query2,function(todos){
                  res.send(todos);
                  next();
              });

          });

          }  

      }

    };


  var inserta_sucursal = function(query){

      return function(req,res,next){
          var query_final = "";

          var llave =  req.headers['x-auth-token'] || '';

          var sucursal = llaves_existentes.existe_llave(llave);

          if (sucursal == null){
              console.log("llave no existe");
              res.send(401,"No autorizado");
              next();
          }else{

            var nombre_sucursal = sucursal.nombre_sucursal;

            query_final = query;

            if (req.params['password']){
              if (req.params['password'] != sucursal.password){
                  res.send(402,"No autorizado");
                  next(); 
                  return;
              }
            }

            if (req.params['direccion']){
                query_final = query_final.replace('!direccion!',req.params['direccion']);
            }

            if (req.params['nombre']){
                query_final = query_final.replace('!nombre!',req.params['nombre']);
            }

            if (req.params['id']){
                query_final = query_final.replace('!id_sucursal!',req.params['id']);
            }

            console.log(req.params);

          }  

          var query_negocio = 'select "Sucursal".id_negocio from "Sucursal" where "Sucursal".id_sucursal = ' + sucursal.id_sucursal;
         
            execute_query(query_negocio,function(todos){

                query_final = query_final.replace('!id_negocio!',todos[0].id_negocio);


                execute_query(query_final,function(todos){

                  console.log(todos);
                  res.send(todos);
                  next();

                });
            });

      }

    };
    var baja_monedero = function(query){

      return function(req,res,next){
          var query_final = "";
          res.setHeader('Access-Control-Allow-Origin','*');

          var llave =  req.headers['x-auth-token'] || '';

          var sucursal = llaves_existentes.existe_llave(llave);

          if (sucursal == null){
              console.log("llave no existe");
              res.send(401,"No autorizado");
              next();
          }else{
            
            var nombre_sucursal = sucursal.nombre_sucursal;

            query_final = query.replace('!nombre_sucursal!',nombre_sucursal );

            if (req.params['monto']){
                query_final = query_final.replace('!monto!',req.params['monto']);

            }

            if (req.params['id']){
              
                query_final = query_final.replace('!id!',req.params['id']);

            }

            console.log(req.params);

          }  

          execute_query(query_final,function(todos){
            console.log(todos);
            

            res.send(todos);
            next();
          });

      }

    };

    var get_query = function(query){
      return function(req,res,next){
          res.setHeader('Access-Control-Allow-Origin','*');

          var query_final = "";

          var llave =  req.headers['x-auth-token'] || '';

          var sucursal = llaves_existentes.existe_llave(llave);

          if (sucursal == null){

              console.log("llave no existe");
              res.send(401,"No autorizado");
              next();
          }else{

            if (req.params['password']){
              if (req.params['password'] != sucursal.password){
                  res.send(402,"No autorizado");
                  next(); 
              }
            }

            var nombre_sucursal = sucursal.nombre_sucursal;

            query_final = query.replace('!id_sucursal!',sucursal.id_sucursal);


            query_final = query_final.replace('!nombre_sucursal!',nombre_sucursal );


            if (req.params['monto']){
                query_final = query_final.replace('!monto!',req.params['monto']);

            }
            if (req.params['id']){
              
                query_final = query_final.replace('!id!',req.params['id']);

            }
            if (req.params['porcentaje']){
              
                query_final = query_final.replace('!porcentaje!',req.params['porcentaje']);

            }
            if (req.params['descripcion']){
              
                query_final = query_final.replace('!descripcion!',req.params['descripcion']);

            }
            if (req.params['nombre']){
              
                query_final = query_final.replace('!nombre!',req.params['nombre']);

            }

            console.log(req.params);

          }  

          query_final = limpia_query(query_final,['id_sucursal']);
          execute_query(query_final,function(todos){

            console.log(todos);


            if (req.params['monto']){

              var query2 = 'INSERT INTO "Transaccion"(id_monedero, id_sucursal, id_usuario, fecha_transaccion, monto) VALUES(!id!, !id_sucursal!, !id_usuario!,'  + "'" +  new Date()+ "'" + ' , !monto!)';
                            
              query2 = query2.replace('!id!',req.params['id']);
              query2 = query2.replace('!id_sucursal!',sucursal.id_sucursal);
              query2 = query2.replace('!id_usuario!',sucursal.id_usuario);
              query2 = query2.replace('!monto!',req.params['monto']);

              execute_query(query2,function(todos) {
                res.send(todos);
                next();
              });
            }else{
              console.log(req.method);
              if (todos.length == 0 && req.method == 'GET'){
                res.send(400,'Peticion incorrecta');
                next();
              }else{
                res.send(todos);
                next();                    
              }
          
            }

          });
      }
    };

    var login = function(){
        return function(req,res,next){
          res.setHeader('Access-Control-Allow-Origin','*');
          if (req.params.user == undefined || req.params.password ==undefined || req.params.user == '' || req.params.password == ''){
              res.send(401,"No autorizado");

          }else{
            req.params.user = req.params.user.replace("'","");
            req.params.user = req.params.user.replace('"',"");
            req.params.user = req.params.user.replace('%',"");

            req.params.password = req.params.password.replace("'","");
            req.params.password = req.params.password.replace('"',"");
            req.params.password = req.params.password.replace('%',"");

            query = 'Select "Usuario".id_usuario, "Sucursal".id_sucursal, "Usuario".id_usuario from "Usuario","Sucursal_admin","Sucursal" where "Usuario".id_usuario = "Sucursal_admin".id_administrador and "Sucursal".nombre_sucursal = '+ "'"+req.params.user+ "'" +' and "Usuario".password = ' +"'" +req.params.password+ "'";
            execute_query(query,function(todos){
              console.log(todos);

              if (todos.length == 0){
                res.send(401,"No autorizado");
              }else{
                var token = genera_llave();

                new llave(token,todos[0].id_usuario,req.params.user,req.params.password,todos[0].id_sucursal);

                res.send(token);
                next();
              }
            });

          }
          console.log(req.params);
          next();
        }
    };


 
    return{"inserta_sucursal":inserta_sucursal, "insert_persona_monedero":insert_persona_monedero, "get_query":get_query, "login":login,"execute_query":execute_query};
 
  }();

  pg.connect(conString, function(err, client, done) {
         
    client_v = client;
    if(err) {
      console.log("Error al conectar");
     
      return;
    }

  });

server.use(restify.bodyParser());
server.use(restify.authorizationParser());
server.use(restify.CORS());


var genera_recurso_login = function(){

    server.get('/login/:user/:password'  , data_base.login());
    server.get('/login/:user/:password/'  , data_base.login());

};

var recurso_sucursal = function () {

  var query = 'insert into "Sucursal"(id_sucursal, nombre_sucursal, id_negocio, direccion) values (!id_sucursal!,' + "'!nombre!'" + ",!id_negocio!,'!direccion!')";
  
  server.get('/sucursal/:id/:nombre/:direccion/:password', data_base.inserta_sucursal(query));

};

var recurso_inserta_promociones = function(){
    var query = 'insert into "Promocion"( nombre, descripcion, porcentaje,id_sucursal) values (' +"'!nombre!',"  + "'!descripcion!'" + ",!porcentaje!,!id_sucursal!)";
    server.post('/promocion/:nombre/:descripcion/:porcentaje/:password', data_base.get_query(query));

};

var recurso_promociones = function(){
    // select "Persona".apellido_pat,"Persona".apellido_mat,"Persona".nombre,"Monedero".monto from "Monedero","Sucursal","Persona" where "Monedero".id_sucursal = "Sucursal".id_sucursal and "Monedero".id_monedero = !id! and "Sucursal".nombre_sucursal = 'mi_sucursal' and "Persona".id_persona = "Monedero".id_persona_cliente

  var query = 'select * from "Promocion","Sucursal" where "Promocion".id_sucursal = "Sucursal".id_sucursal and "Sucursal".nombre_sucursal = ' + "'!nombre_sucursal!'";

  server.get('/promocion', data_base.get_query(query));
  server.get('/promocion/',data_base.get_query(query));
  server.get('/promocion/:id', data_base.get_query(query));

};

var recurso_persona_monedero = function(){


  var query = 'insert into "Persona" (nombre,apellido_pat,apellido_mat,telefono,email) VALUES ' + "('!nombre!','!apellido_pat!','!apellido_mat!','!telefono!','!email!') returning id_persona";
  server.get('/persona/:nombre/:apellido_pat/:apellido_mat/:telefono/:email/:id_monedero', data_base.insert_persona_monedero(query));

};

var recurso_monedero_baja = function(){

  var query = 'UPDATE "Monedero" SET estado_activado = 0 from "Sucursal","Persona" where "Monedero".id_sucursal = "Sucursal".id_sucursal and "Monedero".id_monedero = !id! and "Sucursal".nombre_sucursal = ' +  "'!nombre_sucursal!'" + ' and "Persona".id_persona = "Monedero".id_persona_cliente returning estado_activado';

  server.get('/bajamonedero/:id', data_base.get_query(query));
  server.get('/bajamonedero/:id/:password', data_base.get_query(query));

};

var recurso_transacciones = function () {
  var query = 'select * from "Transaccion" where "Transaccion".id_sucursal = !id_sucursal!';
  server.get('/transacciones/:i', data_base.get_query(query));

}

var recurso_monedero = function(){


  var query = 'select "Persona".apellido_pat,"Persona".apellido_mat,"Persona".nombre,"Monedero".monto from "Monedero","Sucursal","Persona" where "Monedero".id_sucursal = "Sucursal".id_sucursal and "Monedero".id_monedero = !id! and "Sucursal".nombre_sucursal = ' +  "'!nombre_sucursal!'" + ' and "Persona".id_persona = "Monedero".id_persona_cliente';

  server.get('/monedero/:id', data_base.get_query(query));

  var query2 = 'UPDATE "Monedero" SET monto= !monto! WHERE "Monedero".id_monedero = !id!';

  server.get('/monedero/:id/:monto', data_base.get_query(query2));

};


genera_recurso_login();
recurso_promociones();
recurso_monedero();
recurso_persona_monedero();
recurso_monedero_baja();
recurso_transacciones();
recurso_sucursal();
recurso_inserta_promociones();

function corsHandler(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, X-Auth-Token');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');

    return next();
}

function optionsRoute(req, res, next) {

    res.send(200);
    return next();
}

server.opts('/\.*/', corsHandler, optionsRoute);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
