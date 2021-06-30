import React, { Component } from 'react';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles';

import { getRateCards, disableUser, createUser, postRateCard, activateRatecard } from '../API/sale-handler'

const INITIALSTATE = {
    selectedStore: '60188',
    users: [],
    stores: [],
    ratecards: [],
    firstname: '',
    surname: '',
    email: '',
    password: '',
    formerror: null,
    formsuccess: null,
    newUserButtonDisabled: true,
    activeRatecard: null,
    updatingRatecard: null,
    updatingRateCardButtonDisabled: true,
    uploadedRatecard: null,
    uploadedRatecardName: null
}

class AdminPage extends Component {


    constructor(props) {
        super(props)

        this.state = {
            ...INITIALSTATE
        }
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

        getUsers(this.props.firebase, this.state.selectedStore)
            .then(userList => {
                this.setState({ users: userList });
            })
            .catch(err => {
                console.error(err);
            })

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                loadRateCards(token, this.state.selectedStore)
                    .then(ratecards => {
                        for (let card of ratecards) {
                            if (card.active === 1) {
                                this.setState({ activeRatecard: card });
                            }
                        }
                        this.setState({ ratecards });
                    })
                    .catch(err => {
                        this.setState({ popup: err });
                    })
            })
    }

    componentWillUnmount() {
        this.props.firebase.stores().off();
        this.props.firebase.users().off();
    }

    onChange = event => {

        if (event.target?.files?.length >= 1) {
            return this.setState({ [event.target.name]: event.target.files[0] });
        }
        this.setState({ [event.target.name]: event.target.value });

        if (this.state.firstname.length >= 2 && this.state.surname.length >= 2 && this.state.email.length >= 2 && this.state.password.length >= 6) {
            this.setState({ newUserButtonDisabled: false })
        } else {
            this.setState({ newUserButtonDisabled: true })
        }

        if (this.state.activeRatecard === this.state.updatingRatecard) {
            this.setState({ updatingRateCardButtonDisabled: true })
        } else {
            this.setState({ updatingRateCardButtonDisabled: false })
        }
    }

    updateStore = event => {
        event.preventDefault();
        this.setState({ selectedStore: event.target.name });
        getUsers(this.props.firebase, event.target.name)
            .then(userList => {
                this.setState({ users: userList });
            })
            .catch(err => {
                console.error(err);
                this.setState({ formerror: err })
            })


        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                loadRateCards(token, this.state.selectedStore)
                    .then(ratecards => {
                        this.setState({ ratecards })
                    })
                    .catch(err => {
                        this.setState({ popup: err })
                    })
            })
    }

    disableUser = event => {
        event.preventDefault();
        let uid = event.target.name;
        let disable = event.target.innerHTML === 'Disable' ? true : false;

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                disableUser(token, uid)
                    .then(resp => {
                        this.props.firebase.user(uid)
                            .update({ disabled: disable })

                        for (let user of this.state.users) {
                            if (user.uid === uid) {
                                user.disabled = disable;
                            }
                        }
                        getUsers(this.props.firebase, event.target.name)
                            .then(userList => {
                                this.setState({ users: userList });
                            })
                            .catch(err => {
                                console.error(err);
                                this.setState({ formerror: err })
                            })
                    })
                    .catch(err => {
                        console.error(err)
                    })
            })
            .catch(err => {
                console.error(err)
            })
    }

    saveUserHandler = event => {
        event.preventDefault();

        const { email, password, firstname, surname, selectedStore } = this.state;

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                createUser(token, {
                    email: email,
                    password: password,
                    displayName: firstname + ' ' + surname,
                    disabled: false
                })
                    .then(userinfo => {
                        this.props.firebase.user(userinfo.uid)
                            .set({ firstname, surname, email, store: selectedStore, disabled: false })

                        this.setState({
                            firstname: '',
                            surname: '',
                            email: '',
                            password: '',
                            formsuccess: `Account created for ${email}`
                        })

                        getUsers(this.props.firebase, event.target.name)
                            .then(userList => {
                                this.setState({ users: userList });
                            })
                            .catch(err => {
                                console.error(err);
                                this.setState({ formerror: err })
                            })
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({ formerror: err });
                    })
            })
            .catch(err => {
                console.error(err);
                this.setState({ formerror: err });
            })
    }

    uploadRateCard = event => {
        event.preventDefault();
        let storecode = this.state.selectedStore;
        let ratecardname = this.state.uploadedRatecardName;
        let ratecard = this.state.uploadedRatecard;

        if (!storecode || !ratecardname || !ratecard) {
            return this.setState({ formsuccess: 'An error occurred' });
        }

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                postRateCard(token, storecode, ratecardname, ratecard)
                    .then(res => {
                        loadRateCards(token, this.state.selectedStore)
                            .then(ratecards => {
                                this.setState({ ratecards })
                            })
                            .catch(err => {
                                this.setState({ popup: err })
                            })
                        this.setState({ formsuccess: res.success })
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({ formsuccess: 'An error occurred.' })
                    })
            })
    }

    updateRateCard = event => {
        event.preventDefault();
        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                activateRatecard(token, this.state.selectedStore + this.state.updatingRatecard)
                    .then(resp => {
                        this.setState({ formsuccess: resp.success })
                    })
                    .catch(err => {
                        console.error(err);
                    })
            })
            .catch(err => {
                console.error(err);
            })
    }

    render() {

        const { firstname, surname, email, password, formerror, formsuccess, newUserButtonDisabled,
            selectedStore, stores, users, ratecards, activeRatecard, updatingRatecard, uploadedRatecardName } = this.state;

        return (
            <div>
                <h1>Admin</h1>
                {stores.map(store => (
                    <button name={store.storecode} onClick={this.updateStore}>{store.storecode}</button>
                ))}

                <h2>Selected Store: {selectedStore}</h2> <br />

                {formsuccess}

                <h3>New User</h3>
                <form>
                    <label htmlFor='firstname'>First Name </label>
                    <input type='text' name='firstname' placeholder='Firstname' value={firstname} onChange={this.onChange} /><br />
                    <label htmlFor='surname'>Last Name </label>
                    <input type='text' name='surname' placeholder='Surname' value={surname} onChange={this.onChange} /><br />
                    <label htmlFor='email'>Email Address </label>
                    <input type='text' name='email' placeholder='Email Address' value={email} onChange={this.onChange} /><br />
                    <label htmlFor='password'>Password </label>
                    <input type='password' name='password' placeholder='Password' value={password} onChange={this.onChange} /><br />
                </form>
                <button type='submit' name='saveuser' onClick={this.saveUserHandler} disabled={newUserButtonDisabled}>Save</button>
                {formerror}


                <br /><br /><br />

                <h3>All Users</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Disable User</th>
                        </tr>
                    </thead>
                    {users && users.length > 0 ? users.map(user => (
                        <tbody>
                            <tr>
                                <td>{user.firstname} {user.surname}</td>
                                <td>{user.email}</td>
                                <td><button name={user.uid} onClick={this.disableUser}>{user.disabled ? 'Activate' : 'Disable'}</button></td>
                            </tr>
                        </tbody>
                    )) : <tbody><tr><td>No staff found.</td></tr></tbody>}
                </table>

                <br /><br /><br />
                <h3>New Ratecard</h3>
                <input type="file" name="uploadedRatecard" onChange={this.onChange} /><br />
                <input type="text" name="uploadedRatecardName" placeholder='Ratecard name' value={uploadedRatecardName} onChange={this.onChange} />
                <button onClick={this.uploadRateCard}>Submit</button><br />

                <br /><br /><br />
                <h3>All Ratecards</h3>
                <p>Active card: {activeRatecard?.tablename.substr(5)}</p>
                <p>Change ratecard?</p>
                <select name='updatingRatecard' value={updatingRatecard} onChange={this.onChange}>
                    {ratecards && ratecards.length > 0 ? ratecards.map(ratecard => (
                        <option>{ratecard.tablename.substr(5)}</option>
                    )) : <option>No rate cards found.</option>}
                </select>
                <button name='update-ratecard' onClick={this.updateRateCard}>Save</button>
            </div>
        );
    }
}

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

const getUsers = (firebase, storecode) => {
    return new Promise((resolve, reject) => {
        firebase.users().on('value', snapshot => {
            const usersObject = snapshot.val();
            const usersList = Object.keys(usersObject).map(key => ({
                ...usersObject[key],
                uid: key,
            }));
            let userArray = []
            for (let user of usersList) {
                if (user.store === storecode) {
                    userArray.push(user);
                }
            }
            return resolve(userArray);
        });
    })
}

const loadRateCards = (token, storecode) => {
    return new Promise((resolve, reject) => {
        getRateCards(token, storecode)
            .then(ratecards => {
                return resolve(ratecards);
            })
            .catch(err => {
                return reject(err);
            })
    })
}

export default compose(
    withAuthorisation(condition),
    withFirebase,
)(AdminPage);