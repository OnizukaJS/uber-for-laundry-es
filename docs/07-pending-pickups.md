# Iteración #7: recogidas pendientes

Finalmente, necesitamos mostrar las recogidas pendientes de un usuario. El lugar obvio para ver esta lista es la página dashboard. Agreguemos una consulta adicional a esa ruta.

Puede ver nuestra revisada ruta /dashboard en las líneas 18-41 de routes/laundry.js:

```js
// ... inside of routes/laundry.js

router.get('/dashboard', (req, res, next) => {
  let query;

  if (req.session.currentUser.isLaunderer) {
    query = { launderer: req.session.currentUser._id };
  } else {
    query = { user: req.session.currentUser._id };
  }

  LaundryPickup
    .find(query)
    .populate('user', 'name')
    .populate('launderer', 'name')
    .sort('pickupDate')
    .exec((err, pickupDocs) => {
      if (err) {
        next(err);
        return;
      }

      res.render('laundry/dashboard', {
        pickups: pickupDocs
      });
    });
});

router.post('/launderers', (req, res, next) => {
// ...
```

Aspectos destacados de la nueva ruta /dashboard:

    Líneas 20-26: cambia la consulta en función de si eres o no un lavandero. Si el usuario es un lavador de ropa, busca recoger ropa para lavar. De lo contrario, muestra las recogidas de ropa que pidió.
    Líneas 28-31: llama a varios métodos Mongoose para crear una consulta más complicada, que finalice con una llamada al método exec() para proporcionar nuestro callback.
    Líneas 29-30: dado que las propiedades del usuario y del lavandero son referencias a otros documentos, estamos solicitando que esas referencias se rellenen previamente con la propiedad de nombre del modelo User.
    Línea 31: ordena por fecha de recogida en orden ascendente (las fechas más lejanas son las últimas).
    Líneas 38-40: renderiza la plantilla views/laundry/dashboard.hbs como antes pero esta vez dentro del callback.
    Línea 39: pasa los resultados de la consulta (pickupDocs) como la variable local pickups.

Ahora que estamos consultando información adicional en la ruta, necesitamos mostrarla en la vista.

En nuestras líneas 31-44 en views/laundry/dashboard.hbs:

```html
<!-- ... inside of views/laundry/dashboard.hbs -->
<h3> Pending Pickups </h3>
<ul>
{{#each pickups}}
    <li>
      <h4> {{ this.pickupDate }} </h4>

      <ul>
        <li> <b>User</b>: {{ this.user.name }} </li>
        <li> <b>Launderer</b>: {{ this.launderer.name }} </li>
      </ul>
    </li>
{{/each}}
</ul>
```

Ahora visite el dashboard y vea sus recogidas pendientes.

