import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import NewSale from '../NewSale';
import ManagerDash from '../ManagerDash';

import ManageStores from '../ManageStores'
import NewStore from '../ManageStores/newstore'

import ManagerUsers from '../ManageUsers';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

const App = () => (
  <Router>
    <div>
      <div className="header">
        <div className="header-navigation">
          <Navigation />
        </div>
      </div>

      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={ROUTES.NEW_SALE} component={NewSale} />

      <Route path={ROUTES.ADMIN} component={ManagerDash} />

      <Route path={ROUTES.STORES} component={ManageStores} />
      <Route path={ROUTES.NEW_STORE} component={NewStore} />

      <Route path={ROUTES.USERS} component={ManagerUsers} />
      <Route path={ROUTES.NEW_USER} component={NewSale} />
    </div>
  </Router>
);


export default withAuthentication(App);