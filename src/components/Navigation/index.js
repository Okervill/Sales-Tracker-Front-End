import React from 'react';
import { Link } from 'react-router-dom';
import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';


const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ) : (
        <NavigationNonAuth />
      )
    }
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({ authUser }) => (
  <>
    <div className="header-nav-left-items">
      <div className="header-nav-item">
        <Link to={ROUTES.HOME}>Home</Link>
      </div>
      <div className="header-nav-item">
        <Link to={ROUTES.ACCOUNT}>Account</Link>
      </div>
      <div className="header-nav-item">
        <Link to={ROUTES.NEW_SALE}>New Sale</Link>
      </div>
      {
        !!authUser.roles[ROLES.ADMIN] && (
          <div className="header-nav-item">
            <Link to={ROUTES.ADMIN}>Admin</Link>
          </div>
        )
      }
    </div>
    <div className="header-nav-right-items">
      <SignOutButton />
    </div>
  </>
);

const NavigationNonAuth = () => (
  <div className="header-nav-left-items">
    <div className="header-nav-item">
      <Link to={ROUTES.LANDING}>Landing</Link>
    </div>
    <div className="header-nav-item">
      <Link to={ROUTES.SIGN_IN}>Sign In</Link>
    </div>
  </div>
);

export default Navigation;