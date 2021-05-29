import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

class ManageUsers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            users: [],
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.users().on('value', snapshot => {
            const usersObject = snapshot.val();

            const usersList = Object.keys(usersObject).map(key => ({
                ...usersObject[key],
                uid: key,
            }));

            this.setState({
                users: usersList,
                loading: false,
            });
        });
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
    }

    render() {
        const { users, loading } = this.state;

        return (
            <div>
                <h1>Admin</h1>
                <Link to={ROUTES.ADMIN}>Back</Link> <br />
                <Link to={ROUTES.NEW_USER}>New User</Link>

                {loading && <div>Loading ...</div>}

                <UserList users={users} />
            </div>
        );
    }
}

const UserList = ({ users }) => (
    <ul>
        {users.map(user => (
            <li key={user.uid}>
                <span>
                    <strong>Name:</strong> {user.firstname} {user.surname} 
                </span>
                <span>
                    <strong>E-Mail:</strong> {user.email} 
                </span>
                <span>
                    <strong>Store:</strong> {user.store}
                </span>
            </li>
        ))}
    </ul>
);

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
    withAuthorisation(condition),
    withFirebase,
)(ManageUsers);