import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

class AdminPage extends Component {

    render() {

        return (
            <div>
                <h1>Admin</h1>
                <Link to={ROUTES.STORES}>Stores</Link> <br />
                <Link to={ROUTES.USERS}>Users</Link>
            </div>
        );
    }
}

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
    withAuthorisation(condition),
    withFirebase,
)(AdminPage);