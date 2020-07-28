# Iteración #4: Conviértete en un lavandero

Ahora que hemos completado toda nuestra autenticación, podemos comenzar con las características reales de la aplicación. Primero queremos tener un dashboard para los usuarios registrados. En este dashboard, los usuarios podrán convertirse en un lavandero.

Cree un archivo de ruta en la carpeta routes/ llamada routes/laundry.js. Este archivo de ruta tendrá todas las rutas relacionadas con la recogida de la ropa.

```
$ touch routes/laundry.js
```

Tenemos que asegurarnos de conectar routes/laundry.js con app.js. Hacemos esto con *require* en app.js:

** hay que tener en cuenta el orden de los routers, _authRouter_ tiene que ir antes de _laundryRouter_ si queremos ver las rutas de laundry correctamente **

```js
// ... inside of app.js
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const laundryRouter = require('./routes/laundry'); // <= AÑADIR

// ...

// También necesitamos configurar nuestra variable app para usar esas rutas en la línea 80 de app.js:

// ... inside of app.js

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', laundryRouter); // <= AÑADIR

// ...
```

Ahora que las rutas están en su lugar, podemos agregar el contenido inicial a routes/laundry.js:

```js
// routes/laundry.js
const express = require('express');

const router = express.Router();

router.get('/dashboard', (req, res, next) => {
  res.render('laundry/dashboard');
});


module.exports = router;
```

La ruta /dashboard renderiza la vista de views/laundry/dashboard.hbs. Esta plantilla contiene un formulario el cual el usuario enviará para convertirse en lavandero. En otras palabras, el formulario se enviará a una ruta POST que requerirá que actualicemos la información del usuario en la base de datos. Las actualizaciones deberían guardar su nuevo estado como *launderers*. Actualizaremos las propiedades _isLaunderer_ y _fee_ cuando se envíe este formulario.

Nuestra ruta POST es /launderers. Agreguemos eso ahora. Aquí están nuestras rutas routes/laundry.js:

```js
// routes/laundry.js
const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.get('/dashboard', (req, res, next) => {
  res.render('laundry/dashboard');
});

router.post('/launderers', (req, res, next) => {
  const userId = req.session.currentUser._id;
  const laundererInfo = {
    fee: req.body.fee,
    isLaunderer: true
  };

  User.findByIdAndUpdate(userId, laundererInfo, { new: true }, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

    req.session.currentUser = theUser;

    res.redirect('/dashboard');
  });
});


module.exports = router;
```

Aspectos destacados de esta ruta POST:

    Línea 13: obtiene el _id del usuario de la sesión.
    
    Líneas 14-17: prepara la información actualizada con la precio del formulario y isLaunderer está hardcoded como verdadero.
    
    Línea 19: llama al método findByIdAndUpdate() de Mongoose para realizar las actualizaciones.
    
    Línea 25: actualiza la información del usuario en la sesión. Esto funciona en conjunto con la opción { new: true } de la línea 19 para obtener la información actualizada del usuario en el callback.
    
    Línea 27: redirecciona de nuevo al dashboard.

Ahora que el código está en su lugar, ¡intenta convertirte en un lavandero! Podemos verificar que funcionó yendo a MongoDB Compass y consultando la base de datos:

Confirme que el precio del usuario y las propiedades de isLaunderer hayan cambiado.

Sin embargo, los usuarios no podrán verificar MongoDB Compass. Incluso es molesto para nosotros! Deberíamos mostrar comentarios en el dashboard sobre el éxito de convertirse en un launderer.

Aquí está nuestra plantilla actualizada views/laundry/dashboard.hbs:

```html
<!-- views/laundry/dashboard.hbs -->
<h2> Your laundry Dashboard </h2>

<ul>
  <li> <a href="/launderers"> Find a Launderer </a> </li>
  <li> <a href="/logout"> Log Out </a> </li>
</ul>

{{#if currentUserInfo.isLaunderer}}
  <h3> You are a launderer </h3>

  <p>Your laundering fee is <b>${{ currentUserInfo.fee }}.</b></p>
{{else}}
  <h3> Want to become a launderer? </h3>

  <form action="/launderers" method="post">
    <div>
      <label for="fee-input"> Set your fee </label>
      <input type="number" name="fee" id="fee-input">
    </div>

    <button> Become a Launderer </button>
  </form>
{{/if}}
```

Aspectos destacados de views/laundry/dashboard.hbs:


    Líneas 9-12: tenemos una declaración if que muestra un nuevo HTML si el usuario ya es un launderer.
    
    Líneas 14-23: el formulario que antes estaba allí ahora se muestra en el else.

Resultado final: si aún no eres un lavandero, verás el formulario y, si lo eres, verás un mensaje y el precio.

Finalmente, debemos agregar alguna autorización a nuestro dashboard. Tal como está, incluso si no estás logueado, y visitas la página /dashboard directamente podrá verla.

Agreguemos alguna autorización a todas las rutas de la lavandería. Lo haremos agregando un middleware en routes/laundry.js.

En routes/laundry.js puedes ver nuestro middleware:

```js
// routes/laundry.js
const express = require('express');

const User = require('../models/user');

const router = express.Router();

// MIDDLEWARE =>
router.use((req, res, next) => {
  if (req.session.currentUser) {
    next();
    return;
  }

  res.redirect('/login');
});
// <= MIDDLEWARE

router.get('/dashboard', (req, res, next) => {
// ...
```

Este middleware se ejecuta antes que cualquiera de nuestras rutas.

Destacar:

    Líneas 9-12: si hay un usuario en la sesión (logueado), continúa con las rutas llamando a next() y retornando.
    
    Línea 14: si no hay ningún usuario en la sesión (anónimo), redirige a la página log in.

Siguiente - Encuentra un Launderer.