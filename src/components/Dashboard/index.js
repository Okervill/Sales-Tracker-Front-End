import React from 'react';

import { AuthUserContext, withAuthorisation } from '../Session';
import { PasswordForgetForm } from '../PasswordForget';

const AccountPage = () => (
    <AuthUserContext.Consumer>
        {authUser => (
            <div>
                <h1>Account: {authUser.email}</h1>
                <PasswordForgetForm />
            </div>
        )}
    </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(AccountPage);