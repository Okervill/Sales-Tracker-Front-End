import React, { Component } from 'react';
import { compose } from 'recompose';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import * as ROLES from '../../constants/roles'

import './managers.css'

import { getRateCards, disableUser, createUser, postRateCard, activateRatecard, getStoreTargets, setStoreTargets, setStaffTargets } from '../API/sale-handler'
import moment from 'moment';

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
    updatingRatecard: undefined,
    updatingRateCardButtonDisabled: true,
    uploadedRatecard: undefined,
    uploadedRatecardName: null,
    target_new: 0,
    target_upg: 0,
    target_payg: 0,
    target_hbbnew: 0,
    target_ciot: 0,
    target_tech: 0,
    target_bus: 0,
    target_rev: 0,
    totalhours: 0,
    hours: {},
    weightings: {},
    staffTargets: {},
    targetsDate: moment().format('YYYY-MM-DD'),
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
                let weightings = {};
                let hours = {};
                for (let user of userList) {
                    weightings[user.uid] = 100;
                    hours[user.uid] = 0;
                }
                this.setState({ users: userList, weightings, hours });
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

                getStoreTargets(token, this.state.selectedStore, this.state.targetsDate)
                    .then(targets => {
                        if(targets.length >= 1){
                            this.setState({
                                target_new: targets[0].new,
                                target_upg: targets[0].upg,
                                target_payg: targets[0].payg,
                                target_hbbnew: targets[0].hbb,
                                target_ciot: targets[0].ciot,
                                target_tech: targets[0].tech,
                                target_bus: targets[0].business,
                                target_rev: targets[0].revenue,
                            })
                        }
                    })
                    .catch(err => {
                        console.error(err);
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
                        for (let ratecard of ratecards) {
                            if (ratecard.active === 1) {
                                this.setState({ activeRatecard: ratecard })
                            }
                        }
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

    onTargetsChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        let staffTargets = calculateTargets(this.state.target_new, this.state.target_upg, this.state.target_hbbnew, this.state.target_ciot, this.state.target_bus, this.state.target_tech, this.state.target_rev, this.state.target_payg, this.state.weightings, this.state.hours, this.state.selectedStore, this.state.targetsDate)
        this.setState({ staffTargets });
    }

    onHoursChange = event => {
        let hours = this.state.hours;
        hours[event.target.name] = event.target.value
        let totalhours = calculateTotalHours(hours, this.state.weightings);
        let staffTargets = calculateTargets(this.state.target_new, this.state.target_upg, this.state.target_hbbnew, this.state.target_ciot, this.state.target_bus, this.state.target_tech, this.state.target_rev, this.state.target_payg, this.state.weightings, hours, this.state.selectedStore, this.state.targetsDate)
        this.setState({ hours, totalhours, staffTargets });
    }

    onWeightingChange = event => {
        let weightings = this.state.weightings;
        weightings[event.target.name] = event.target.value;
        let totalhours = calculateTotalHours(this.state.hours, weightings);
        let staffTargets = calculateTargets(this.state.target_new, this.state.target_upg, this.state.target_hbbnew, this.state.target_ciot, this.state.target_bus, this.state.target_tech, this.state.target_rev, this.state.target_payg, weightings, this.state.hours, this.state.selectedStore, this.state.targetsDate)
        this.setState({ weightings, totalhours, staffTargets });
    }

    onSaveTargets = event => {
        let storetargets = {
            store: this.state.selectedStore,
            date: moment().format('YYYY-MM-DD'),
            new: this.state.target_new,
            upg: this.state.target_upg,
            payg: this.state.target_payg,
            hbb: this.state.target_hbbnew,
            ciot: this.state.target_ciot,
            tech: this.state.target_tech,
            bus: this.state.target_bus,
            rev: this.state.target_rev,
        };

        let targetArr = []
        for(let key of Object.keys(this.state.staffTargets)){
            targetArr.push(this.state.staffTargets[key]);
        }
        let targetsArray = targetArr.map(obj => {
            return Object.keys(obj).sort().map(key => {
              return obj[key];
            })
          });

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                setStoreTargets(token, storetargets)
                    .then(resp => {
                        console.log(resp);
                    })
                    .catch(err => {
                        console.error(err);
                    })

                setStaffTargets(token, targetsArray, this.state.selectedStore, this.state.targetsDate)
                    .then(resp => {
                        console.log(resp);
                    })
                    .catch(err => {
                        console.error(err);
                    })
            })
    }

    onTargetsDateChange = event => {
        this.setState({[event.target.name]: event.target.value})
        
        this.props.firebase.auth.currentUser.getIdToken()
        .then(token => {
            getStoreTargets(token, this.state.selectedStore, event.target.value)
            .then(targets => {
                if(targets.length >= 1){
                    this.setState({
                        target_new: targets[0].new,
                        target_upg: targets[0].upg,
                        target_payg: targets[0].payg,
                        target_hbbnew: targets[0].hbb,
                        target_ciot: targets[0].ciot,
                        target_tech: targets[0].tech,
                        target_bus: targets[0].business,
                        target_rev: targets[0].revenue,
                    })
                } else {
                    this.setState({
                        target_new: 0,
                        target_upg: 0,
                        target_payg: 0,
                        target_hbbnew: 0,
                        target_ciot: 0,
                        target_tech: 0,
                        target_bus: 0,
                        target_rev: 0,
                    })
                }
            })
            .catch(err => {
                console.error(err);
            })
        })
    }

    render() {

        const { firstname, surname, email, password, formerror, formsuccess, newUserButtonDisabled,
            selectedStore, stores, users, ratecards, activeRatecard, updatingRatecard, uploadedRatecardName,
            target_new, target_upg, target_payg, target_hbbnew, target_bus, target_ciot, target_rev,
            target_tech, targetsDate } = this.state;

        return (
            <div>
                <h1>Admin</h1>


                {stores.map(store => (
                    <>
                        <button name={store.storecode} onClick={this.updateStore}>{store.storecode}</button>
                    </>
                ))}
                <h2>Selected Store: {selectedStore}</h2> <br />

                {formsuccess}

                <Tabs>
                    <TabList>
                        <Tab>Staff</Tab>
                        <Tab>Targets</Tab>
                        <Tab>Ratecards</Tab>
                    </TabList>
                    <TabPanel>
                        <div className="admin-newuser-container">
                            <h3 className="admin-newuser-form-title">New User</h3>
                            <form className="admin-newuser-form">
                                <label htmlFor='firstname'>First Name </label>
                                <input type='text' name='firstname' placeholder='Firstname' value={firstname} onChange={this.onChange} /><br />
                                <label htmlFor='surname'>Last Name </label>
                                <input type='text' name='surname' placeholder='Surname' value={surname} onChange={this.onChange} /><br />
                                <label htmlFor='email'>Email Address </label>
                                <input type='text' name='email' placeholder='Email Address' value={email} onChange={this.onChange} /><br />
                                <label htmlFor='password'>Password </label>
                                <input type='password' name='password' placeholder='Password' value={password} onChange={this.onChange} /><br />
                            </form>
                            <button className="admin-newuser-submit" type='submit' name='saveuser' onClick={this.saveUserHandler} disabled={newUserButtonDisabled}>Save</button>
                            {formerror}
                        </div>

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
                    </TabPanel>
                    <TabPanel>
                        <h3>Store Targets - Under construction</h3>
                        <label htmlFor='targetsDate'>Targets for: </label>
                        <input type='date' name='targetsDate' value={targetsDate} onChange={this.onTargetsDateChange}/>
                        <table className='targets-table'>
                            <thead className='targets-table-head'>
                                <tr>
                                    <th>New</th>
                                    <th>Upg</th>
                                    <th>PAYG</th>
                                    <th>HBB</th>
                                    <th>CIOT</th>
                                    <th>Tech</th>
                                    <th>Business</th>
                                    <th>Rev</th>
                                </tr>
                            </thead>
                            <tbody className='targets-table-body'>
                                <tr>
                                    <td><input className='targets-table-input' name='target_new' value={target_new} onChange={this.onTargetsChange} /></td>
                                    <td><input className='targets-table-input' name='target_upg' value={target_upg} onChange={this.onTargetsChange} /></td>
                                    <td><input className='targets-table-input' name='target_payg' value={target_payg} onChange={this.onTargetsChange} /></td>
                                    <td><input className='targets-table-input' name='target_hbbnew' value={target_hbbnew} onChange={this.onTargetsChange} /></td>
                                    <td><input className='targets-table-input' name='target_ciot' value={target_ciot} onChange={this.onTargetsChange} /></td>
                                    <td><input className='targets-table-input' name='target_tech' value={target_tech} onChange={this.onTargetsChange} /></td>
                                    <td><input className='targets-table-input' name='target_bus' value={target_bus} onChange={this.onTargetsChange} /></td>
                                    <td><input className='targets-table-input' name='target_rev' value={target_rev} onChange={this.onTargetsChange} /></td>
                                </tr>
                            </tbody>
                        </table>
                        <table className='weightings-table'>
                            <thead>
                                <tr>
                                    <th>Staff</th>
                                    <th>Hours Worked</th>
                                    <th>Weighting</th>
                                    <th>New</th>
                                    <th>Upg</th>
                                    <th>PAYG</th>
                                    <th>HBB</th>
                                    <th>CIOT</th>
                                    <th>Tech</th>
                                    <th>Business</th>
                                    <th>Rev</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr>
                                        <td>{user.firstname} {user.surname}</td>
                                        <td><input name={user.uid} className='targets-table-input' value={this.state.hours[user.uid]} onChange={this.onHoursChange} /></td>
                                        <td>
                                            <select name={user.uid} value={this.state.weightings.uid} onChange={this.onWeightingChange}>
                                                <option>100</option>
                                                <option>95</option>
                                                <option>90</option>
                                                <option>85</option>
                                                <option>80</option>
                                                <option>75</option>
                                                <option>70</option>
                                                <option>65</option>
                                                <option>60</option>
                                                <option>55</option>
                                                <option>50</option>
                                                <option>45</option>
                                                <option>40</option>
                                                <option>35</option>
                                                <option>30</option>
                                                <option>25</option>
                                                <option>20</option>
                                                <option>15</option>
                                                <option>10</option>
                                                <option>5</option>
                                                <option>0</option>
                                            </select>
                                        </td>
                                        <td><label>{this.state.staffTargets[user.uid]?.new}</label></td>
                                        <td><label>{this.state.staffTargets[user.uid]?.upg}</label></td>
                                        <td><label>{this.state.staffTargets[user.uid]?.payg}</label></td>
                                        <td><label>{this.state.staffTargets[user.uid]?.hbb}</label></td>
                                        <td><label>{this.state.staffTargets[user.uid]?.ciot}</label></td>
                                        <td><label>{this.state.staffTargets[user.uid]?.tech}</label></td>
                                        <td><label>{this.state.staffTargets[user.uid]?.business}</label></td>
                                        <td><label>{this.state.staffTargets[user.uid]?.revenue}</label></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={this.onSaveTargets}>Save Targets</button>
                    </TabPanel>
                    <TabPanel>
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
                    </TabPanel>
                </Tabs>
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

const calculateTotalHours = (hours, weightings) => {
    let totalHours = 0;
    for (let key of Object.keys(hours)) {
        if (weightings[key]) {
            totalHours += parseFloat(hours[key]) * parseFloat(weightings[key]) / 100;
        } else {
            totalHours += parseFloat(hours[key]);
        }
    }
    return totalHours;
}

const calculateTargets = (target_new, target_upg, target_hbbnew, target_ciot, target_bus, target_tech, target_rev, target_payg, staffWeightings, staffHours, store, date) => {
    let staffTargets = [];
    let uids = Object.keys(staffWeightings);
    let totalHours = calculateTotalHours(staffHours, staffWeightings);
    for (let uid of uids) {
        let userTargets = {};

        if (staffHours[uid] === 0 || staffHours[uid] === '0') {
            userTargets.new = 0;
            userTargets.upg = 0;
            userTargets.payg = 0;
            userTargets.hbb = 0;
            userTargets.ciot = 0;
            userTargets.business = 0;
            userTargets.tech = 0;
            userTargets.revenue = 0;
            userTargets.employee = uid;
            userTargets.storecode = store;
            userTargets.hours = staffHours[uid];
            userTargets.weighting = staffWeightings[uid];
            userTargets.date = date;

            staffTargets[uid] = userTargets;
            continue;
        }

        //target * hours * weighting% / total hours
        let newtarget = parseFloat(target_new) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);
        let upgtarget = parseFloat(target_upg) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);
        let paygtarget = parseFloat(target_payg) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);
        let hbbtarget = parseFloat(target_hbbnew) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);
        let ciottarget = parseFloat(target_ciot) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);
        let bustarget = parseFloat(target_bus) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);
        let techtarget = parseFloat(target_tech) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);
        let revtarget = parseFloat(target_rev) * parseFloat(staffHours[uid]) * (parseFloat(staffWeightings[uid]) / 100) / parseFloat(totalHours);

        userTargets.new = Math.ceil(newtarget);
        userTargets.upg = Math.ceil(upgtarget);
        userTargets.payg = Math.ceil(paygtarget);
        userTargets.hbb = Math.ceil(hbbtarget);
        userTargets.ciot = Math.ceil(ciottarget);
        userTargets.business = Math.ceil(bustarget);
        userTargets.tech = Math.ceil(techtarget);
        userTargets.revenue = Math.ceil(revtarget);
        userTargets.employee = uid;
        userTargets.storecode = store;
        userTargets.hours = staffHours[uid];
        userTargets.weighting = staffWeightings[uid];
        userTargets.date = date;

        staffTargets[uid] = userTargets;
    }

    return staffTargets;
}

export default compose(
    withAuthorisation(condition),
    withFirebase,
)(AdminPage);