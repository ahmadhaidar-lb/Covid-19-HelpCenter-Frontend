import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isAuth } from '../helpers/auth';
import Login from '.././screens/Login.jsx';
const SignedIn = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isAuth() ? (
                <Redirect
                to={{
                    pathname: '/home',
                    state: { from: props.location }
                }}
            />
            ) : (
                 <Route path='/login' exact render={props => <Login {...props} />} />
                
            )
        }
    ></Route>
);

export default SignedIn;