import React from 'react';
import { Link } from 'react-router-dom';
import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
    <div className="header-nav-item" onClick={firebase.doSignOut}>
        <Link to="/">Sign Out</Link>
    </div>
);

export default withFirebase(SignOutButton);