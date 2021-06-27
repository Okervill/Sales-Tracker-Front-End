import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

import { postRateCard, getRateCards } from '../API/sale-handler';

class ManageStores extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            submitdisabed: true,
            filename: '',
            ratecardfile: undefined,
            stores: [],
            users: [],
            ratecards: [],
            popup: undefined,
            selectedrate: undefined
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
                });
            } else {
                this.setState({
                    stores: '',
                })
            }
        });

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

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                getRateCards(token, 'all')
                    .then(ratecards => {
                        this.setState({ ratecards });
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({ popup: err });
                    })
            })
            .catch(err => {
                console.error(err);
                this.setState({ popup: err });
            })
    }

    componentWillUnmount() {
        this.props.firebase.stores().off();
        this.props.firebase.users().off();
    }

    onChange = event => {
        if (event.target?.files?.length >= 1) {
            this.setState({ [event.target.name]: event.target.files[0] });
        } else {
            this.setState({ [event.target.name]: event.target.value });
            if (event.target.value.charAt(event.target.value.length - 1) === ' ') {
                let string = event.target.value.substring(0, event.target.value.length - 1) + '_'
                this.setState({ [event.target.name]: string })
            }
        }
        if (this.state.filename.length >= 5 && this.state.ratecardfile !== undefined) {
            this.setState({ submitdisabed: false });
        }
    }

    onSubmit = event => {
        event.preventDefault();
        let storecode = event.target.name;
        let ratecardname = this.state.filename;
        let ratecard = this.state.ratecardfile;

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                postRateCard(token, storecode, ratecardname, ratecard)
                    .then(res => {
                        this.setState({ popup: res.success })
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({ popup: 'An error occurred.' })
                    })
            })
    }

    render() {
        const { stores, loading, popup, ratecards, selectedrate } = this.state;

        return (
            <div>
                <h1>Admin</h1>
                <Link to={ROUTES.ADMIN}>Back</Link> <br />
                <Link to={ROUTES.NEW_STORE}>New Store</Link>

                {loading && <div>Loading ...</div>}
                {popup ? popup : ''}

                <ul>
                    {stores === '' ? 'No stores found' : stores.map((store) => (
                        <li key={store.uid}>
                            {store.storecode} | {store.storename} <br />
                            Upload a new rate card <br />
                            <input type="file" name="ratecardfile" onChange={this.onChange} /><br />
                            <input type="text" name="filename" value={this.state.filename} onChange={this.onChange} /><br />
                            <button onClick={this.onSubmit} name={store.storecode} disabled={this.state.submitdisabed} >Submit</button><br />
                            <select name='type' value={selectedrate} onChange={this.onChange}>
                                {ratecards.length === 0 ? '' : ratecards.map((ratecard) => (
                                    <option key={ratecards.tablename}>{ratecard.tablename}</option>
                                ))}
                            </select>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
    withAuthorisation(condition),
    withFirebase,
)(ManageStores);