# Iteración #2: Log In

Ahora que nos hemos registrado, necesitamos poder iniciar sesión. La ruta para la página de inicio de sesión será /login. Como está relacionado con la autenticación, queremos incluirlo en nuestro archivo routes/auth.js. En las líneas 64-68 puede ver nuestra ruta de inicio de sesión:

```js
// ... inside of routes/auth.js
      res.redirect('/');
    });
  });
});


router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    errorMessage: ''
  });
});


module.exports = router;
```

La ruta /login renderiza la vista de views/auth/login.hbs. Observe nuevamente que tenemos una variable local errorMessage. La usaremos para dar feedback al usuario después de que envíe el formulario. Cuando visitamos por primera vez la página de inicio de sesión, errorMessage estará vacía.

La ruta GET /login renderiza un formulario que el usuario enviará para autenticarse con la aplicación. En otras palabras, el formulario se enviará a una ruta POST que requerirá crear una sesión para ese usuario. El siguiente paso será configurar session.

Instale express-session y connect-mongo en la terminal: 

```
$ npm install --save express-session connect-mongo
```

Ahora necesitaremos tanto express-session como connect-mongo en app.js:

```js
// ... inside of app.js
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');

const session = require('express-session'); // <<<< ESTA LINEA
const MongoStore = require('connect-mongo')(session); // <<<< ESTA LINEA

const indexRouter = require('./routes/index');
// ...
```

Luego configuramos session y la agregamos como middleware a nuestra aplicación. Ver en app.js:

```js
// ... inside of app.js
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// AGREGAMOS EL SIGUIENTE BLOQUE
app.use(session({
  secret: 'never do your own laundry again',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use('/', indexRouter);
// ...
```

Tenga en cuenta que hemos cambiado la opción *secret*. 

Ahora podemos finalizar nuestra ruta POST la cual recibirá el envío del formulario del log in. Verifique las actualizaciones de nuestro archivo routes/auth.js:

```js
// ... inside of routes/auth.js
router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    errorMessage: ''
  });
});

router.post('/login', (req, res, next) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput === '') {
    res.render('auth/login', {
      errorMessage: 'Enter both email and password to log in.'
    });
    return;
  }

  User.findOne({ email: emailInput }, (err, theUser) => {
    if (err || theUser === null) {
      res.render('auth/login', {
        errorMessage: `There isn't an account with email ${emailInput}.`
      });
      return;
    }

    if (!bcrypt.compareSync(passwordInput, theUser.password)) {
      res.render('auth/login', {
        errorMessage: 'Invalid password.'
      });
      return;
    }

    req.session.currentUser = theUser;
    res.redirect('/');
  });
});


module.exports = router;
```

Aspectos destacados de esta ruta POST:

    Línea 81: encuentra al usuario por su email.
    
    Línea 89: utiliza el método compareSync() para verificar la contraseña.
    
    Línea 96: si todo funciona, guarda la información del usuario en req.session.

Así que hemos iniciado sesión, pero no lo sabría simplemente mirando la página de inicio. ¡Se ve igual que antes! Necesitamos personalizar la homepage para los usuarios registrados. Sin embargo, antes de hacer eso, hagamos que sea más fácil verificar el estado de inicio de sesión en la vista.

Agregue nuestro middleware personalizado a las líneas 66-75 en app.js:

```js
// ... inside of app.js
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'never do your own laundry again',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));
// AGREGAMOS ESTE BLOQUE
app.use((req, res, next) => {
  if (req.session.currentUser) {
    res.locals.currentUserInfo = req.session.currentUser;
    res.locals.isUserLoggedIn = true;
  } else {
    res.locals.isUserLoggedIn = false;
  }

  next();
});

app.use('/', index);
// ...
```

Antes de que sucedan las rutas, este middleware verifica si hay una sesión. Si hay, setea algunos *locals* en la respuesta para que la vista acceda. Tenemos dos locals:

    isUserLoggedIn: un booleano que indica si hay un usuario conectado o no.
    currentUserInfo: la información del usuario de la sesión (solo disponible si ha iniciado sesión).

Ese middleware facilita la personalización de la homepage para los usuarios logueados. ¡Hagámoslo ahora!

Aquí está nuestro archivo de plantilla views/index.hbs actualizado:

```html
<!-- views/index.hbs -->
<p> Welcome to {{ title }}. </p>

{{#if isUserLoggedIn}}
  <p> Hello, {{ currentUserInfo.name }}. </p>
{{/if}}

<nav>
  <ul>
    {{#if isUserLoggedIn}}
     <li> <a href="/launderers"> Find a Launderer </a> </li>
      <li> <a href="/dashboard"> See Dashboard </a> </li>
      <li> <a href="/logout"> Log Out </a> </li>
    {{else}}
      <li> <a href="/signup"> Sign Up </a> </li>
      <li> <a href="/login"> Log In </a> </li>
    {{/if}}
  </ul>
</nav>
```
Destacar:

    Lines 4-6: una declaración if muestra un mensaje especial para los usuarios registrados.
    Lines 10-17: una declaración if..else muestra algunos de los enlaces a usuarios registrados y otros a usuarios anónimos.

Siguiente - Log Out.