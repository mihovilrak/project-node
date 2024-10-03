import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Navigate to="/login" />
      )
    }
  />
);

export default PrivateRoute;
