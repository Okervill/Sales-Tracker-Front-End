import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

class ManageStores extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            stores: [],
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.stores().on('value', snapshot => {
            const storesObject = snapshot.val();

            if (storesObject !== null && storesObject !== undefined) {
                const storesList = Object.keys(storesObject).map(key => ({
                    ...storesObject[key],
                    uid: key,
                }));

                this.setState({
                    stores: storesList,
                    loading: false,
                });
            } else {
                this.setState({
                    stores: '',
                    loading: false
                })
            }
        });
    }

    componentWillUnmount() {
        this.props.firebase.stores().off();
    }

    render() {
        const { stores, loading } = this.state;

        return (
            <div>
                <h1>Admin</h1>
                <Link to={ROUTES.ADMIN}>Back</Link> <br />
                <Link to={ROUTES.NEW_STORE}>New Store</Link>

                {loading && <div>Loading ...</div>}

                <StoreList stores={stores} />
            </div>
        );
    }
}

const StoreList = ({ stores }) => (
    <ul>
        {stores === '' ? 'No stores found' : stores.map(store => (
            <li key={store.uid}>
                <span>
                    <strong>ID:</strong> {store.storecode}
                </span>
                <span>
                    <strong>Name:</strong> {store.storename}
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
)(ManageStores);