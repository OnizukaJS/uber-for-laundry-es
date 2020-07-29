# Metas de aprendizaje

    Agregar autenticación de usuario básica a una aplicación Express.
    Crear sesiones en una aplicación Express.
    Almacenar la información del usuario en la sesión y utilizarla en algunas rutas.
    Evitar que usuarios anónimos (sin estar logueados) accedan a secciones de su aplicación.

## Setup

Hacemos fork de este repositorio:

https://github.com/danieljdsgit/uber-for-laundry-es.git

Luego clonamos el repositorio de Uber For Laundry en la carpeta ~/code/lab para obtener el código inicial.

```
$ git clone https://github.com/githubaccount/uber-for-laundry-es.git

$ cd uber-for-laundry-es/
```

Ejecute npm install para obtener todos los módulos del archivo package.json.

```
$ npm install
```

## .gitignore

Creamos el archivo .gitignore en la raíz de nuestro proyecto:

```
node_modules    # Dependency directory
npm-debug.log   # Debug log from npm
.env            # Environment Variables should NEVER be published
```

## Introducción

Seamos realistas: todo el mundo tiene que lavar la ropa. Incluso Batman.

![](giphy.gif)

La lavandería toma mucho tiempo. Ni hablemos de doblar cada prenda, a menudo es tentador no hacerlo. Salir con la ropa sucia. ¿Quién lo sabrá?

Hasta el día en que todos tengamos robots para lavarnos la ropa, tenemos que hacerlo nosotros mismos.

¿Qué pasaría si pudiéramos crear una aplicación en la que pudiéramos hacer que otras personas nos laven la ropa? No, no hablamos de tu madre. Estoy hablando de extraños con mucho tiempo libre que podrían ganar algo de dinero extra. ¡Gente normal como tú o yo!

Crearemos una aplicación para resolver el problema de la lavandería usando Express, Mongoose, bcrypt y sessions. ¡Tal vez realmente nos convertiremos en Uber for Laundry!

La aplicación permitirá a los usuarios registrarse y programar la recogida de ropa. Serán capaces de:

- Registrarse como usuario (sign up)
- Iniciar sesión (log in)
- Cerrar sesión (log out)
- Convertirse en un lavandero (opcional).
- Encontrar un lavandero.
- Programar una recogida de ropa con un lavandero.
- Ver recogidas pendientes.

## Starter Code

El código inicial para este proyecto incluye:


- Una estructura de aplicación creada por express-generator.
- Un layout ya creado.
- Vistas para todas las páginas con las que vamos a trabajar.
- Los modelos User y LaundryPickup.

```
        starter-code/
        ├── .gitignore
        ├── app.js
        ├── bin
        │   └── www
        ├── models
        │   ├── laundry-pickup.js
        │   └── user.js
        ├── package.json
        ├── public
        │   └── stylesheets
        │       └── style.css
        ├── routes
        │   ├── index.js
        │   └── users.js
        └── views
            ├── auth
            │   ├── login.hbs
            │   └── signup.hbs
            ├── error.hbs
            ├── index.hbs
            ├── laundry
            │   ├── dashboard.hbs
            │   ├── launderer-profile.hbs
            │   └── launderers.hbs
            └── layout.hbs
```

Si visita la página de inicio (homepage), verá que hay un montón de links que no funcionan. Agregaremos las rutas para cada una de esas páginas como parte de esta lección.

Para iniciar el servidor con nodemon, puede usar el siguiente comando: ```npm run dev```

¡Vamos a escribir código!