import React from 'react';

import { AuthUserContext, withAuthorisation } from '../Session';

const HomePage = () => (
    <AuthUserContext.Consumer>
        {authUser => (
            <div>
                <h1>Dashboard</h1>
                <p>This will display the sales for: {authUser.email} | {authUser.uid}
                </p>
            </div>
        )}
    </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(HomePage);