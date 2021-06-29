import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';

import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

import { createUser } from '../API/sale-handler'

class NewUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            firstname: '',
            surname: '',
            email: '',
            password: '',
            store: '60188',
            allstores: [],
            formerror: null,
            formsuccess: null,
            buttonDisabled: false
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.stores().on('value', snapshot => {
            const storesObject = snapshot.val();

            if (storesObject !== null && storesObject !== undefined) {

                const storesArr = []
                Object.keys(storesObject).map(key => {
                    return storesArr.push(key)
                })

                this.setState({
                    allstores: storesArr,
                    loading: false,
                });
            } else {
                this.setState({
                    allstores: [],
                    loading: false
                })
            }

            if (this.state.allstores && this.state.allstores.length === 0) {
                this.setState({ formerror: 'Please add a store before creating users', buttonDisabled: true })
            }
        });
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    saveUserHandler(event) {
        event.preventDefault();
        const { firstname, surname, email, password, store } = this.state;

        if (!firstname || !surname || !email || !password || !store) {
            return this.setState({ formerror: `Missing data: ${firstname ? '' : 'firstname '} ${surname ? '' : 'surname '} ${email ? '' : 'email '} ${password ? '' : 'password '} ${store ? '' : 'store '}` })
        }

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
                        .set({firstname, surname, email, store, disabled: false})
                    
                    this.setState({
                        firstname: '',
                        surname: '',
                        email: '',
                        password: '',
                        formsuccess: `Account created for ${email}`
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

    render() {

        const { allstores, formerror, formsuccess, firstname, surname, email, password } = this.state;

        return (
            <>
                <div>
                    <Link to={ROUTES.USERS}>All users</Link>
                </div>

                {formsuccess}

                <form>
                    <label htmlFor='firstname'>First Name</label>
                    <input type='text' name='firstname' value={firstname} onChange={event => this.onChange(event)} />
                    <label htmlFor='surname'>Last Name</label>
                    <input type='text' name='surname' value={surname} onChange={event => this.onChange(event)} />
                    <label htmlFor='email'>Email Address</label>
                    <input type='text' name='email' value={email} onChange={event => this.onChange(event)} />
                    <label htmlFor='password'>Password</label>
                    <input type='password' name='password' value={password} onChange={event => this.onChange(event)} />
                    <label htmlFor='stores'>Stores</label>

                    <select name='store' onChange={event => this.onChange(event)} >
                        <StoreList stores={allstores} />
                    </select>

                    <button type='submit' name='saveuser' onClick={event => this.saveUserHandler(event)} disabled={this.state.buttonDisabled}>Save</button>
                    {formerror}
                </form>
            </>
        );

    }
}

const StoreList = ({ stores }) => (
    <>
        {stores === [] ? 'No stores found' : stores.map(store => (
            <option value={store} key={store}>{store}</option>
        ))}
    </>
);

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
    withAuthorisation(condition),
    withFirebase,
)(NewUser);