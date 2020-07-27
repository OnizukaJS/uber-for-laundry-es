# Iteración #3: Log Out

Ahora que hemos iniciado sesión, necesitamos poder cerrar sesión. Tenemos links a la ruta /logout en nuestra aplicación, solo tenemos que definir esa ruta.

Añadir el siguiente código después de las rutas de signup y login":

```js
// ... inside of routes/auth.js
    req.session.currentUser = theUser;
    res.redirect('/');
  });
});


router.get('/logout', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/');
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/');
  });
});


module.exports = router;
```

Destacar:

    Line 107: llama a req.session.destroy() para borrar la sesión para cerrar sesión.
    Line 113: redirecciona a la página de inicio cuando haya terminado.

Siguiente - Conviértete en un lavandero.