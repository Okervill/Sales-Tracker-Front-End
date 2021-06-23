import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { AuthUserContext, withAuthorisation } from '../Session';
import { getsales } from '../API/sale-handler';

import './home.css';

class HomePage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            users: [],
            selectedUser: undefined,
            sales: [],
            currentUser: {},
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
                ent: 0
            }
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
        }
        console.log(this.state);
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.props.firebase.user(this.props.firebase.auth.currentUser.uid).once('value', snapshot => {
            const obj = snapshot.val();
            this.setState({ 'currentUser': obj });
        })

        this.props.firebase.users().once('value', snapshot => {
            const usersObject = snapshot.val();

            const usersList = Object.keys(usersObject).map(key => ({
                ...usersObject[key],
                uid: key,
            }));

            let currentStoreList = [];

            for (let userinfo of usersList) {
                if (userinfo.store === this.state.currentUser.store) {
                    currentStoreList.push(userinfo);
                }
            }

            this.setState({ users: currentStoreList });
        });

        this.setState({ 'selectedUser': this.props.firebase.auth.currentUser.uid });
        this.getUserSales(this.props.firebase.auth.currentUser.uid);
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
    }

    getUserSales(uid) {
        getsales(uid)
            .then(sales => {
                let kpis = { ...this.state.kpis }
                for (let sale of sales) {
                    delete sale.employee;
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
                    this.setState({ kpis })
                }
                this.setState({ loading: false, sales: sales });
            })
            .catch(err => {
                console.error(err);
            })
    }

    render() {
        return (
            <AuthUserContext.Consumer>
                {authUser => (
                    <div>
                        <h1>Dashboard for {authUser.firstname} {authUser.surname}</h1>

                        <select name='selectedUser' value={this.state.selectedUser} onChange={this.handleChange}>
                            {
                                this.state.users.map(user => (
                                    <option value={user.uid}>{user.firstname} {user.surname}</option>
                                ))
                            }
                        </select>


                        <Tabs>
                            <TabList>
                                <Tab key='KPIs'>KPIs</Tab>
                                <Tab key='Sales'>Sales</Tab>
                            </TabList>

                            <TabPanel>
                                <h2>KPIs</h2>
                                <KPITable kpis={this.state.kpis} />
                            </TabPanel>

                            <TabPanel>
                                <h2>Sales</h2>
                                <SaleTable sales={this.state.sales} />
                            </TabPanel>

                        </Tabs>
                    </div>
                )}
            </AuthUserContext.Consumer>
        )
    }
}

const KPITable = ({ kpis }) => (
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
            </tr>
        </thead>

        {
            <tbody>
                <tr>
                    <td>{kpis.new}</td>
                    <td>{kpis.upg}</td>
                    <td>{kpis.payg}</td>
                    <td>{kpis.hbbnew}</td>
                    <td>{kpis.hbbupg}</td>
                    <td>{kpis.ins}</td>
                    <td>{kpis.ciot}</td>
                    <td>{kpis.bus}</td>
                    <td>{kpis.tech}</td>
                    <td>{kpis.ent}</td>
                </tr>
            </tbody>
        }
    </table>
)

const SaleTable = ({ sales }) => (
    <table key='SaleTable'>
        <thead key='SaleTable THead'>
            <tr key='SaleTable TR Head'>
                <th>Transaction Number</th>
                <th>Order Number</th>
                <th>Sale Type</th>
                <th>Sale Revenue</th>
                <th>SKUs</th>
            </tr>
        </thead>
        <tbody>
            {
                sales.map((sale, i) => (
                    <tr key={i}>
                        <td>{sale.transactionnumber}</td>
                        <td>{sale.ordernumber}</td>
                        <td>{sale.saletype}</td>
                        <td>£{sale.salerev}</td>
                        <td>
                            <table key='SaleTable SKU'>
                                <thead key='SaleTable SKU THead'>
                                    <tr key='SaleTable SKU Header'>
                                        <th>SKU</th><th>Type</th><th>Description</th><th>Rev</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        sale.skus.map((sku, j) => (
                                            <tr key={`${i}${j}`}>
                                                <td>{sku.sku}</td>
                                                <td>{sku.type}</td>
                                                <td>{sku.description}</td>
                                                <td>£{sku.rev}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </td>
                    </tr>
                ))
            }
        </tbody>

    </table>
)

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(HomePage);