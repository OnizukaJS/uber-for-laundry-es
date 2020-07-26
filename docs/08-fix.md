# Iteración #8: Fix

Podemos agregar una pequeña solución para no vernos nosotros mismos como lavanderos disponibles.  
Cambie el filtro de búsqueda en la ruta '/launderers' para que podamos ver todos los lavanderos excepto nosotros mismos.

```js
router.get('/launderers', (req, res, next) => {
  User.find(
    {
      $and: [
        { isLaunderer: true },
        { _id: { $ne: req.session.currentUser._id } }
      ]
    },
    (err, launderersList) => {
      if (err) {
        next(err);
        return;
      }
      res.render('laundry/launderers', {
        launderers: launderersList
      });
    }
  );
});
```