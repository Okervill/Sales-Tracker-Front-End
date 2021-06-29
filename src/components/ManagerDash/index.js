import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

import { getRateCards, disableUser, createUser } from '../API/sale-handler'

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
    buttonDisabled: true
}

class AdminPage extends Component {


    constructor(props){
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
                this.setState({users: userList});
            })
            .catch(err => {
                console.error(err);
            })

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                loadRateCards(token, this.state.selectedStore)
                    .then(ratecards => {
                        this.setState({ratecards})
                    })
                    .catch(err => {
                        this.setState({popup: err})
                    })
            })
    }

    componentWillUnmount() {
        this.props.firebase.stores().off();
        this.props.firebase.users().off();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        if(this.state.firstname.length >= 2 && this.state.surname.length >= 2 && this.state.email.length >= 2 && this.state.password.length >= 6){
            this.setState({ buttonDisabled: false })
        }
    }

    updateStore = event => {
        event.preventDefault();
        this.setState({selectedStore: event.target.name});
        getUsers(this.props.firebase, event.target.name)
            .then(userList => {
                this.setState({users: userList});
            })
            .catch(err => {
                console.error(err);
                this.setState({formerror: err})
            })


        this.props.firebase.auth.currentUser.getIdToken()
        .then(token => {
            loadRateCards(token, this.state.selectedStore)
                .then(ratecards => {
                    this.setState({ratecards})
                })
                .catch(err => {
                    this.setState({popup: err})
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

                        for(let user of this.state.users){
                            if(user.uid === uid){
                                user.disabled = disable;
                            }
                        }
                        getUsers(this.props.firebase, event.target.name)
                        .then(userList => {
                            this.setState({users: userList});
                        })
                        .catch(err => {
                            console.error(err);
                            this.setState({formerror: err})
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
                    .set({firstname, surname, email, store: selectedStore, disabled: false})
                
                this.setState({
                    firstname: '',
                    surname: '',
                    email: '',
                    password: '',
                    formsuccess: `Account created for ${email}`
                })

                getUsers(this.props.firebase, event.target.name)
                .then(userList => {
                    this.setState({users: userList});
                })
                .catch(err => {
                    console.error(err);
                    this.setState({formerror: err})
                })                
            })
            .catch(err => {
                console.error(err);
                this.setState({formerror: err});
            })
        })
        .catch(err => {
            console.error(err);
            this.setState({formerror: err});
        })
    }

    updateRateCard = event => {
        event.preventDefault();
    }

    render() {

        const {firstname, surname, email, password, formerror, formsuccess, buttonDisabled, selectedStore, stores, users, ratecards } = this.state;

        return (
            <div>
                <h1>Admin</h1>
                {stores.map(store => (
                        <button name={store.storecode} onClick={this.updateStore}>{store.storecode}</button>
                ))}

                <h2>Selected Store: {selectedStore}</h2> <br />

                <h3>New User</h3>
                {formsuccess}
                <form>
                    <label htmlFor='firstname'>First Name</label>
                    <input type='text' name='firstname' value={firstname} onChange={this.onChange} />
                    <label htmlFor='surname'>Last Name</label>
                    <input type='text' name='surname' value={surname} onChange={this.onChange} />
                    <label htmlFor='email'>Email Address</label>
                    <input type='text' name='email' value={email} onChange={this.onChange} />
                    <label htmlFor='password'>Password</label>
                    <input type='password' name='password' value={password} onChange={this.onChange} />
                </form> 
                <button type='submit' name='saveuser' onClick={ this.saveUserHandler } disabled={buttonDisabled}>Save</button>
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
                <h3>Rate Cards</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratecards && ratecards.length > 0 ? ratecards.map(ratecard => (
                            <tr>
                                <td>{ratecard.tablename.substr(5)}</td>
                                <td><button name={ratecard.tablename} onClick={this.updateRateCard} disabled={ratecard.active}>Activate</button></td>
                            </tr>
                        )) : <tbody><tr><td>No rate cards found.</td></tr></tbody>}
                    </tbody>
                </table>

                <Link to={ROUTES.STORES}>Stores</Link> <br />
                <Link to={ROUTES.USERS}>Users</Link>
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
            for(let user of usersList){
                if(user.store === storecode){
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