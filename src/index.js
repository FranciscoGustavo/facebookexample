const express = require('express');
const passport = require('passport');
const FB = require('fb').default;
const config = require('./config');
console.log(FB.api);
/*
FB.extend({
  appId: config.facebookClientID, 
  appSecret: config.facebookClientSecret
}),*/

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
console.log(config);
/**
 * Requerimos estrategia para acceder o conectar con facebook
 */
require('./fbStartegy');

/**
 * ruta para hacer login con facebook al cual le solicitaremos 4 permisos
 * public_profile: 
 * 
 * pages_show_list: https://developers.facebook.com/docs/permissions/reference/pages_show_list
 *    Nos permite ver una lista con las paginas que administra el usuario de facebook, del cual
 *    saceremos informacion como un token y un id
 * 
 * pages_messaging: https://developers.facebook.com/docs/permissions/reference/pages_messaging
 *    Nos permite enviar mensajes a nuestros usuarios de facebook
 * 
 * pages_manage_metadata: https://developers.facebook.com/docs/permissions/reference/pages_manage_metadata
 *    Nos permite suscribirnos a eventos de webhook
 */
app.get("/auth/facebook", passport.authenticate(
  "facebook",
 { scope: ['public_profile', 'pages_show_list', 'pages_messaging', 'pages_manage_metadata'] }
));


/**
 * Ruta a la que facebook nos redirigira despues de haber hecho login
 */
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  async function(req, res, next) {
    // Usamos el api de facebook para realizar dos acciones
    // 1.- Obtener la lista de paginas del usuario 
    FB.setAccessToken(req.user.accessToken);
    const listedPages = await FB.api(`${req.user.profile.id}/accounts`, 'get');

    // Guardamos la primera pagina
    const page = listedPages.data[0];
    
    // 2.- Enviamos una peticion post donde suscribimos los eventos del webhook
    FB.setAccessToken(page.access_token);
    const isSuccess = await FB.api(`${page.id}/subscribed_apps`, 'post', {
      subscribed_fields: ["messages", "messaging_postbacks", "messaging_optins"],
    });

    if(isSuccess.success) console.log('Suscripcion a eventos de webhook exitoso')

    res.status(200).send({
      user: {
        id: req.user.profile.id,
        name: req.user.profile.displayName,
      },
      pages: listedPages,
    });
  }
);

/**
 * Webhook que valida el token que establecimos en nuestra 
 * configuracion del proyecto de facebook
 */
app.get('/webhook', (req, res) => {
  if(req.query['hub.verify_token'] === config.webhookToken){
    console.log('Coneccion con el webhook exitosa');
    res.send(req.query['hub.challenge']);
  } else {
    console.log('No tienes permisos');
    res.send('No tienes permisos.');
  }
});


/**
 * webhook por metodo POST esta ruta recibira todo el trafico de messenger
 */
app.post('/webhook', (req, res) => {
  const webhook_event = req.body.entry[0];
  console.log(webhook_event);
  res.sendStatus(200);
});

app.listen(config.port, (error) => {
  console.log(error);
  console.log('server is runing');
});