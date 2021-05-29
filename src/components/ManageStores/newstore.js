import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

class NewStore extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            storecode: '',
            storename: '',
            formerror: null
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
                    stores: [],
                    loading: false
                })
            }
        });
    }

    componentWillUnmount() {
        this.props.firebase.stores().off();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    saveStoreHandler(event) {
        event.preventDefault();
        const { storecode, storename } = this.state;

        if (storecode === '' || storename === '') {
            return this.setState({ formerror: 'Please fill in both Store Code and Store Name' })
        }

        //Check store exists
        for (let store of this.state.stores) {
            if (store.storecode === storecode) {
                return this.setState({ formerror: 'Store code already exists' })
            }
            if (store.storename === storename) {
                return this.setState({ formerror: 'Store name already exists' })
            }
        }

        // Create a store in your Firebase realtime database
        this.props.firebase
            .store(storecode)
            .set({ storename, storecode });

        this.props.history.push(ROUTES.STORES);
    }

    render() {

        return (
            <>
                <div>
                    <Link to={ROUTES.STORES}>All stores</Link>
                </div>

                <form>
                    <label htmlFor='Store Code'>Store Code</label>
                    <input type='text' name='storecode' onChange={event => this.onChange(event)} />
                    <label htmlFor='Store Code'>Store Name</label>
                    <input type='text' name='storename' onChange={event => this.onChange(event)} />
                    <button type='submit' name='savestore' onClick={event => this.saveStoreHandler(event)}>Save</button>
                    {this.state.formerror}
                </form>
            </>
        );

    }
}

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
    withAuthorisation(condition),
    withFirebase,
)(NewStore);