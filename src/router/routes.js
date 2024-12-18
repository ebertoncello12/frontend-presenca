// src/Routes.js
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import App from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';

const routes = () => {
  // Verifica se o usuário está autenticado (simulado)
  const isAuthenticated = false; // Aqui você pode implementar a lógica de autenticação real

  return (
    <Router>
      <Switch>
        <Route path="/login">
          {isAuthenticated ? <Redirect to="/" /> : <Login />}
        </Route>
        <Route path="/">
          {isAuthenticated ? <App /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </Router>
  );
};

export default routes;
