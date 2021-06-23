import React, { Component } from 'react';

import { AuthUserContext, withAuthorisation } from '../Session';
import { getsales } from '../API/sale-handler';

import './home.css';

class HomePage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            sales: [],
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
    }

    componentDidMount() {
        this.setState({ loading: true });

        getsales(this.props.firebase.auth.currentUser.uid)
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


                        <h2>KPIs</h2>
                        <table>
                            <tr>
                                {Object.keys(this.state.kpis).map(key => (
                                    < th > {key}</th>
                                ))}
                            </tr>

                            {
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
                                </tr>
                            }
                        </table>

                        <h2>Sales</h2>
                        {this.state.sales.length >= 1 ?
                            (<table>

                                <tr>
                                    <th>Transaction Number</th>
                                    <th>Order Number</th>
                                    <th>Sale Type</th>
                                    <th>Sale Revenue</th>
                                    <th>SKUs</th>
                                </tr>

                                {
                                    this.state.sales.map(sale => (
                                        <tr>
                                            <td>{sale.transactionnumber}</td>
                                            <td>{sale.ordernumber}</td>
                                            <td>{sale.saletype}</td>
                                            <td>£{sale.salerev}</td>
                                            <td>
                                                <table>
                                                    <tr>
                                                        <th>SKU</th><th>Type</th><th>Description</th><th>Rev</th>
                                                    </tr>

                                                    {
                                                        sale.skus.map(sku => (
                                                            <tr>
                                                                <td>{sku.sku}</td>
                                                                <td>{sku.type}</td>
                                                                <td>{sku.description}</td>
                                                                <td>£{sku.rev}</td>
                                                            </tr>
                                                        ))
                                                    }

                                                </table>
                                            </td>
                                        </tr>
                                    ))
                                }

                            </table>
                            ) : ''}

                    </div>
                )
                }
            </AuthUserContext.Consumer>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(HomePage);