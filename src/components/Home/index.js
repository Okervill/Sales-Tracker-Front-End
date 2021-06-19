import React, { Component } from 'react';

import { AuthUserContext, withAuthorisation } from '../Session';
import { getsales } from '../API/sale-handler';

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
                console.log(this.state.kpis)
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


                        <p>KPIs:</p>
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


                        <p>Sales:</p>
                        {this.state.sales.length >= 1 ?
                            (<table>

                                <tr>
                                    {Object.keys(this.state.sales[0]).map(key => (
                                        < th > {key}</th>
                                    ))}
                                </tr>

                                {
                                    this.state.sales.map(sale => (
                                        <tr>
                                            <td>{sale.transactionnumber}</td>
                                            <td>{sale.ordernumber}</td>
                                            <td>{sale.saletype}</td>
                                            <td>{sale.business}</td>
                                            <td>{sale.new}</td>
                                            <td>{sale.upg}</td>
                                            <td>{sale.payg}</td>
                                            <td>{sale.hbbnew}</td>
                                            <td>{sale.hbbupg}</td>
                                            <td>{sale.ins}</td>
                                            <td>{sale.ciot}</td>
                                            <td>{sale.bus}</td>
                                            <td>{sale.tech}</td>
                                            <td>{sale.ent}</td>
                                            <td>{sale.saves}</td>
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