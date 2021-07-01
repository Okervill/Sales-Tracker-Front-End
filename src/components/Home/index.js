import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { AuthUserContext, withAuthorisation } from '../Session';
import { getsales } from '../API/sale-handler';
import * as ROLES from '../../constants/roles';
import moment from 'moment';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import './home.css';

class HomePage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            users: [],
            selectedUser: undefined,
            selectedStore: JSON.parse(localStorage.getItem('authUser')).store,
            sales: [],
            currentUser: JSON.parse(localStorage.getItem('authUser')),
            kpis: {
                new: 0,
                upg: 0,
                payg: 0,
                hbbnew: 0,
                hbbupg: 0,
                ins: 0,
                ciot: 0,
                bus: 0,
                tech: 0,
                ent: 0,
                totalrev: 0
            },
            gridAPI: null,
            columnAPI: null,
            columnDefs: [
                {
                    headerName: 'Date', field: 'transactionnumber', sortable: true, filter: true, editable: true, resizable: true, comparator: dateComparator, cellRenderer: function (param) {
                        let datestring = param.data.transactionnumber.substr(12);
                        let momentdate = moment(datestring).format('DD-MM-YYYY');
                        return momentdate;
                    }
                },
                { headerName: 'Employee', field: 'employee', sortable: true, filter: true, editable: true, resizable: true },
                { headerName: 'Transaction Number', field: 'transactionnumber', sortable: true, filter: true, editable: true, resizable: true },
                { headerName: 'Order Number', field: 'ordernumber', sortable: true, filter: true, editable: true, resizable: true },
                { headerName: 'Sale Type', field: 'saletype', sortable: true, filter: true, editable: true, resizable: true },
                {
                    headerName: 'Revenue', field: 'salerev', sortable: true, filter: true, editable: true, resizable: true, cellRenderer: function (param) {
                        return '£' + param.data.salerev;
                    }
                },
                {
                    headerName: 'SKUs', field: 'skus', cellRenderer: function (param) {
                        let displayString = ''
                        for (let sku of param.data.skus) {
                            displayString = `£${sku.rev} ${sku.description}<br />`
                        }
                        return displayString
                    }, width: 500
                }
            ],
            rowData: null,
            startDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
            endDate: moment().clone().endOf('month').format('YYYY-MM-DD')
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
        if (event.target.name === 'selectedUser') {
            let kpis = {
                new: 0,
                upg: 0,
                payg: 0,
                hbbnew: 0,
                hbbupg: 0,
                ins: 0,
                ciot: 0,
                bus: 0,
                tech: 0,
                ent: 0
            }
            this.setState({ kpis })
            this.getUserSales(event.target.value);
        } else if (event.target.name === 'startDate' || event.target.name === 'endDate') {
            this.getUserSales(this.state.selectedUser);
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.users().once('value', snapshot => {
            const usersObject = snapshot.val();

            const usersList = Object.keys(usersObject).map(key => ({
                ...usersObject[key],
                uid: key,
            }));

            let currentStoreList = [];

            for (let userinfo of usersList) {
                if (userinfo.store === this.state.selectedStore) {
                    currentStoreList.push(userinfo);
                }
            }
            this.setState({ users: currentStoreList });
        });

        this.setState({ 'selectedUser': this.state.currentUser.uid });
        this.getUserSales(this.state.currentUser.uid);
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
    }

    getUserSales(uid) {
        if (this.props.firebase.auth.currentUser === null) return
        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                getsales(token, uid, this.state.startDate, this.state.endDate)
                    .then(sales => {

                        let kpis = {
                            new: 0,
                            upg: 0,
                            payg: 0,
                            hbbnew: 0,
                            hbbupg: 0,
                            ins: 0,
                            ciot: 0,
                            bus: 0,
                            tech: 0,
                            ent: 0,
                            totalrev: 0,
                        }

                        for (let sale of sales) {

                            //Get Staff Names
                            for (let staff of this.state.users) {
                                if (staff.uid === sale.employee) {
                                    sale.employee = staff.firstname + ' ' + staff.surname;
                                }
                            }

                            for (let sku of sale.skus) {
                                kpis.totalrev += parseFloat(sku.rev);
                            }

                            //Set KPIs
                            kpis.new += parseInt(sale.new)
                            kpis.upg += parseInt(sale.upg)
                            kpis.payg += parseInt(sale.payg)
                            kpis.hbbnew += parseInt(sale.hbbnew)
                            kpis.hbbupg += parseInt(sale.hbbupg)
                            kpis.ins += parseInt(sale.ins)
                            kpis.ciot += parseInt(sale.ciot)
                            kpis.bus += parseInt(sale.bus)
                            kpis.tech += parseInt(sale.tech)
                            kpis.ent += parseInt(sale.ent)
                        }
                        kpis.totalrev = '£' + kpis.totalrev.toFixed(2);
                        this.setState({ rowData: sales, kpis });
                        this.setState({ loading: false, sales: sales });

                        if (this.state.columnAPI !== null) {
                            let allColumnIds = [];

                            this.state.columnAPI.getAllColumns().forEach(function (column) {
                                allColumnIds.push(column.colId);
                            });

                            this.state.columnAPI.autoSizeColumns(allColumnIds, false);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
            })
            .catch(err => {
                console.error(err);
            })
    }

    onGridReady = (params) => {
        const gridAPI = params.api;
        const columnAPI = params.columnApi;

        this.setState({ gridAPI, columnAPI })

        let allColumnIds = [];

        columnAPI.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        columnAPI.autoSizeColumns(allColumnIds, false);
    }

    render() {
        return (
            <AuthUserContext.Consumer >
                {authUser => (
                    <div>
                        <h1>Dashboard</h1>

                        <select name='selectedUser' value={this.state.selectedUser} onChange={this.handleChange}>
                            <option value='store-60188'>Store 60188</option>
                            {
                                this.state.users.map(user => (
                                    <option value={user.uid}>{user.firstname} {user.surname}</option>
                                ))
                            }
                        </select>

                        <label>From</label>
                        <input type='date' name='startDate' value={this.state.startDate} onChange={this.handleChange} />
                        <label>To</label>
                        <input type='date' name='endDate' value={this.state.endDate} onChange={this.handleChange} />

                        <Tabs>
                            <TabList>
                                <Tab key='KPIs'>KPIs</Tab>
                                <Tab key='Sales'>Sales</Tab>
                            </TabList>

                            <TabPanel>
                                <h2>KPIs</h2>
                                <table>
                                    <thead>
                                        <tr key='KPITable Header'>
                                            <th>New</th>
                                            <th>Upg</th>
                                            <th>PAYG</th>
                                            <th>HBB New</th>
                                            <th>HBB Upg</th>
                                            <th>Insurance</th>
                                            <th>CIOT</th>
                                            <th>Business</th>
                                            <th>Tech</th>
                                            <th>Entertainment</th>
                                            {!!authUser.roles[ROLES.ADMIN] ? <th>Rev</th> : ''}
                                        </tr>
                                    </thead>

                                    {
                                        <tbody>
                                            <tr>
                                                <td>{this.state.kpis.new}</td>
                                                <td>{this.state.kpis.upg}</td>
                                                <td>{this.state.kpis.payg}</td>
                                                <td>{this.state.kpis.hbbnew}</td>
                                                <td>{this.state.kpis.hbbupg}</td>
                                                <td>{this.state.kpis.ins}</td>
                                                <td>{this.state.kpis.ciot}</td>
                                                <td>{this.state.kpis.bus}</td>
                                                <td>{this.state.kpis.tech}</td>
                                                <td>{this.state.kpis.ent}</td>
                                                {!!authUser.roles[ROLES.ADMIN] ? <td>{this.state.kpis.totalrev}</td> : ''}
                                            </tr>
                                        </tbody>
                                    }
                                </table>
                            </TabPanel>

                            <TabPanel>
                                <h2>Sales</h2>
                                <div
                                    className="ag-theme-balham"
                                    style={{ width: '100%', height: 300 }}
                                >
                                    <AgGridReact
                                        columnDefs={this.state.columnDefs}
                                        rowData={this.state.rowData}
                                        onGridReady={this.onGridReady}
                                    />
                                </div>
                            </TabPanel>

                        </Tabs>
                    </div>
                )
                }
            </AuthUserContext.Consumer >
        )
    }
}

// DATE COMPARATOR FOR SORTING
function dateComparator(date1, date2) {
    var date1Number = _monthToNum(date1);
    var date2Number = _monthToNum(date2);

    if (date1Number === null && date2Number === null) {
        return 0;
    }
    if (date1Number === null) {
        return -1;
    }
    if (date2Number === null) {
        return 1;
    }

    return date1Number - date2Number;
}

// HELPER FOR DATE COMPARISON
function _monthToNum(date) {
    if (date === undefined || date === null || date.length !== 10) {
        return null;
    }

    var yearNumber = date.substring(6, 10);
    var monthNumber = date.substring(3, 5);
    var dayNumber = date.substring(0, 2);

    var result = yearNumber * 10000 + monthNumber * 100 + dayNumber;
    // 29/08/2004 => 20040829
    return result;
}

const condition = authUser => !!authUser;
export default withAuthorisation(condition)(HomePage);