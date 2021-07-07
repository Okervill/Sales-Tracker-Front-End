import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import { getReceiptData, postsale, getsku } from '../API/sale-handler';
import { compose } from 'recompose';
import loadinggif from './loadinggif.gif';

const INITIALSTATE = {
    loading: false,
    currentUser: JSON.parse(localStorage.getItem('authUser')),
    error: '',
    receiptdata: undefined,
    exists: false,
    adviser: '',
    date: new Date().toISOString().split('T')[0],
    transactionID: '',
    orderNumber: '',
    skus: [],
    type: 'New',
    revenue: 0,
    saves: false,
    business: false,
    kpis: {
        kpinew: 0,
        upg: 0,
        payg: 0,
        hbbupg: 0,
        hbbnew: 0,
        ins: 0,
        ciot: 0,
        tech: 0,
        ent: 0,
        bus: 0
    },
    SKU1: {
        sku: '',
        description: '',
        type: '',
        rev: 0,
        upgrev: 0,
        newrev: 0
    },
    SKU2: {
        sku: '',
        description: '',
        type: '',
        rev: 0,
        upgrev: 0,
        newrev: 0
    },
    SKU3: {
        sku: '',
        description: '',
        type: '',
        rev: 0,
        upgrev: 0,
        newrev: 0
    },
    SKU4: {
        sku: '',
        description: '',
        type: '',
        rev: 0,
        upgrev: 0,
        newrev: 0
    },
    SKU5: {
        sku: '',
        description: '',
        type: '',
        rev: 0,
        upgrev: 0,
        newrev: 0
    },
    submitDisabled: true,
    submitDisabledReason: 'Initial State',
}

class NewSaleForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ...INITIALSTATE
        }
    }

    onChange = event => {
        if (event.target?.files?.length >= 1) {
            this.setState({ [event.target.name]: event.target.files[0] })
            this.props.firebase.auth.currentUser.getIdToken()
                .then(token => {
                    this.getImageData(token);
                })
            return;
        } else if (event.target.name === 'SKU1' || event.target.name === 'SKU2' || event.target.name === 'SKU3' || event.target.name === 'SKU4' || event.target.name === 'SKU5') {
            let info = this.state[event.target.name];
            info.sku = event.target.value;
            this.setState({ [event.target.name]: info });
            if (event.target.value.length >= 6) {
                this.props.firebase.auth.currentUser.getIdToken()
                    .then(token => {
                        let querystore = this.state.currentUser.store;
                        if (this.state.transactionID?.length >= 6) {
                            querystore = this.state.transactionID.substr(0, 5);
                        }
                        getsku(token, querystore, event.target.value)
                            .then(skudata => {
                                if (skudata.error === 'SKU Not Found') {
                                    skudata = {
                                        sku: event.target.value,
                                        description: 'SKU Not Found',
                                        type: '',
                                        newrev: 0,
                                        upgrev: 0,
                                        rev: 0,
                                        valid: false
                                    }
                                    this.setState({ [event.target.name]: skudata })

                                    let isValidData = this.checkValidData(this.state);
                                    this.setState({ submitDisabled: !isValidData });
                                } else {
                                    if (this.state.type === 'New') {
                                        skudata.rev = skudata.newrev;
                                    } else {
                                        skudata.rev = skudata.upgrev;
                                    }
                                    this.setState({ [event.target.name]: skudata });

                                    let saleRevenue = 0;
                                    if (!isNaN(this.state.SKU1.rev) && this.state.SKU1.rev !== '') {
                                        saleRevenue += parseFloat(this.state.SKU1.rev);
                                    }
                                    if (!isNaN(this.state.SKU2.rev) && this.state.SKU2.rev !== '') {
                                        saleRevenue += parseFloat(this.state.SKU2.rev);
                                    }
                                    if (!isNaN(this.state.SKU3.rev) && this.state.SKU3.rev !== '') {
                                        saleRevenue += parseFloat(this.state.SKU3.rev);
                                    }
                                    if (!isNaN(this.state.SKU4.rev) && this.state.SKU4.rev !== '') {
                                        saleRevenue += parseFloat(this.state.SKU4.rev);
                                    }
                                    if (!isNaN(this.state.SKU5.rev) && this.state.SKU5.rev !== '') {
                                        saleRevenue += parseFloat(this.state.SKU5.rev);
                                    }
                                    this.setState({ revenue: saleRevenue });
                                }

                                this.checkValidData(this.state);

                            })
                    })
                    .catch(err => {
                        this.setState({ error: err });
                    })
            } else {
                let defaultSKU = {
                    sku: event.target.value,
                    description: '',
                    type: '',
                    newrev: 0,
                    upgrev: 0,
                    rev: 0
                }
                this.setState({ [event.target.name]: defaultSKU });

                let currentState = this.state;
                currentState[event.target.name] = defaultSKU;

                let isValidData = this.checkValidData(currentState);
                this.setState({ submitDisabled: !isValidData });
            }
        } else if (event.target.name === 'type') {
            let sku1 = this.state.SKU1;
            let sku2 = this.state.SKU2;
            let sku3 = this.state.SKU3;
            let sku4 = this.state.SKU4;
            let sku5 = this.state.SKU5;
            if (event.target.value === 'New') {
                this.setState({ saves: false });
                sku1.rev = this.state.SKU1?.newrev;
                sku2.rev = this.state.SKU2?.newrev;
                sku3.rev = this.state.SKU3?.newrev;
                sku4.rev = this.state.SKU4?.newrev;
                sku5.rev = this.state.SKU5?.newrev;
            } else {
                sku1.rev = this.state.SKU1?.upgrev;
                sku2.rev = this.state.SKU2?.upgrev;
                sku3.rev = this.state.SKU3?.upgrev;
                sku4.rev = this.state.SKU4?.upgrev;
                sku5.rev = this.state.SKU5?.upgrev;
            }
            let saleRevenue = 0;
            if (!isNaN(sku1.rev) && sku1.rev !== '') {
                saleRevenue += parseFloat(sku1.rev);
            }
            if (!isNaN(sku2.rev) && sku2.rev !== '') {
                saleRevenue += parseFloat(sku2.rev);
            }
            if (!isNaN(sku3.rev) && sku3.rev !== '') {
                saleRevenue += parseFloat(sku3.rev);
            }
            if (!isNaN(sku4.rev) && sku4.rev !== '') {
                saleRevenue += parseFloat(sku4.rev);
            }
            if (!isNaN(sku5.rev) && sku5.rev !== '') {
                saleRevenue += parseFloat(sku5.rev);
            }
            this.setState({ SKU1: sku1, SKU2: sku2, SKU3: sku3, SKU4: sku4, SKU5: sku5, revenue: saleRevenue });
            this.setState({ [event.target.name]: event.target.value });

        } else if (event.target.name === 'saves') {

            if (this.state.saves !== true && (this.state.SKU1.type === 'SIMO AIRTIME' || this.state.SKU1.type === 'SIMO')) {
                let sku1 = this.state.SKU1;
                sku1.rev = this.state.SKU1.upgrev / 2;
                this.setState({ SKU1: sku1 });
            } else if (this.state.saves === true && (this.state.SKU1.type === 'SIMO AIRTIME' || this.state.SKU1.type === 'SIMO')) {
                let sku1 = this.state.SKU1;
                sku1.rev = this.state.SKU1.upgrev;
                this.setState({ SKU1: sku1 });
            }

            let saleRevenue = 0;
            if (!isNaN(this.state.SKU1.rev) && this.state.SKU1.rev !== '') {
                saleRevenue += parseFloat(this.state.SKU1.rev);
            }
            if (!isNaN(this.state.SKU2.rev) && this.state.SKU2.rev !== '') {
                saleRevenue += parseFloat(this.state.SKU2.rev);
            }
            if (!isNaN(this.state.SKU3.rev) && this.state.SKU3.rev !== '') {
                saleRevenue += parseFloat(this.state.SKU3.rev);
            }
            if (!isNaN(this.state.SKU4.rev) && this.state.SKU4.rev !== '') {
                saleRevenue += parseFloat(this.state.SKU4.rev);
            }
            if (!isNaN(this.state.SKU5.rev) && this.state.SKU5.rev !== '') {
                saleRevenue += parseFloat(this.state.SKU5.rev);
            }

            this.setState({ saves: !this.state.saves, revenue: saleRevenue });

        } else if (event.target.name === 'business') {
            this.setState({ business: !this.state.business });
        } else {
            this.setState({ [event.target.name]: event.target.value });
        }

        if (event.target.name === 'SKU1' || event.target.name === 'SKU2' || event.target.name === 'SKU3' || event.target.name === 'SKU4' || event.target.name === 'SKU5') {
            return
        }

        let saleData = this.state;
        saleData[event.target.name] = event.target.value;
        this.checkValidData(saleData);
    }

    getImageData(token) {
        this.setState({ loading: true });
        const { receiptdata } = this.state;
        getReceiptData(token, receiptdata, this.props.firebase.auth.currentUser.uid, this.state.currentUser.store)
            .then(data => {
                this.setState({ loading: false });
                if (data.message && data.message === 'Request has unsupported document format') {
                    this.setState({ error: 'Unsupported file type' });
                } else {
                    if (data.type === '' && data.skus.length === 1) {
                        data.type = data.skus[0].type;
                    }
                    for (let i = 0; i < data.skus.length; i++) {
                        if (data.type === 'New') {
                            data.skus[i].rev = data.skus[i].newrev;
                        } else {
                            data.skus[i].rev = data.skus[i].upgrev;
                        }
                        this.setState({ [`SKU${i + 1}`]: data.skus[i] });
                    }
                    this.setState({ ...data });

                    if (data.exists === true) {
                        console.log('Invalid Sale: Already added');
                        this.setState({ submitDisabledReason: 'Sale has already been added', submitDisabled: true });
                    } else {
                        this.setState({ submitDisabledReason: '' });
                    }
                }

                this.checkValidData(this.state);
            })
            .catch(error => {
                error = JSON.stringify(error)
                this.setState({ error });
            })
    }

    onSubmit = event => {
        event.preventDefault();

        let saledata = {
            transactionnumber: this.state.transactionID,
            ordernumber: this.state.orderNumber,
            employee: this.state.currentUser.uid,
            saletype: this.state.type,
            business: false,
            new: this.state.kpis.kpinew,
            upg: this.state.kpis.upg,
            payg: this.state.kpis.payg,
            hbbnew: this.state.kpis.hbbnew,
            hbbupg: this.state.kpis.hbbupg,
            ins: this.state.kpis.ins,
            ciot: this.state.kpis.ciot,
            bus: this.state.kpis.bus,
            tech: this.state.kpis.tech,
            ent: this.state.kpis.ent,
            saves: false,
            date: this.state.date,
        }

        let saleskus = [];
        for (let sku of this.state.skus) {
            sku.transactionnumber = this.state.transactionID;
            saleskus.push(sku);
        }
        if (this.state.SKU1.valid === true) {
            saleskus.push(this.state.SKU1)
        }
        if (this.state.SKU2.valid === true) {
            saleskus.push(this.state.SKU2)
        }
        if (this.state.SKU3.valid === true) {
            saleskus.push(this.state.SKU3)
        }
        if (this.state.SKU4.valid === true) {
            saleskus.push(this.state.SKU4)
        }
        if (this.state.SKU5.valid === true) {
            saleskus.push(this.state.SKU5)
        }

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                postsale(token, saledata, saleskus)
                    .then(response => {
                        console.log(response);
                    })
                    .catch(err => {
                        console.error(err);
                    })
                this.setState({ ...INITIALSTATE });
            })
    }

    kpiButton = event => {
        event.preventDefault();
        let kpi = event.target.name.split('-')[0];
        let kpis = this.state.kpis;
        if (event.target.name.split('-')[1] === 'up') {
            kpis[kpi]++;
        } else {
            if (kpis[kpi] > 0) {
                kpis[kpi]--;
            }
        }
        this.setState({ kpis });
    }

    checkValidData = (saledata) => {

        //Check transaction number
        if (saledata.transactionID === '') {
            console.log('Invalid Sale: Transaction Number Missing');
            this.setState({ submitDisabledReason: 'Transaction Number is required' });
            return this.setState({ submitDisabled: true });
        }

        if (saledata.transactionID.length !== 20) {
            console.log('Invalid Sale: Transaction Number Length');
            this.setState({ submitDisabledReason: 'The transaction number must be 20 digits' });
            return this.setState({ submitDisabled: true });
        }

        //Check order number
        if (saledata.orderNumber === '') {
            console.log('Invalid Sale: Order Number Missing');
            this.setState({ submitDisabledReason: 'Order Number is required' });
            return this.setState({ submitDisabled: true });
        }

        if (saledata.orderNumber.length !== 20) {
            console.log('Invalid Sale: Order Number Length');
            this.setState({ submitDisabledReason: 'The order number must be 20 characters' });
            return this.setState({ submitDisabled: true });
        }

        //Check SKU data
        if (saledata.SKU1.sku === "" && saledata.SKU2.sku === "" && saledata.SKU3.sku === "" && saledata.SKU4.sku === "" && saledata.SKU5.sku === "") {
            console.log('Invalid Sale: SKUs Missing');
            this.setState({ submitDisabledReason: 'No SKU has been added' });
            return this.setState({ submitDisabled: true });
        }

        if (saledata.SKU1.sku !== "" && !saledata.SKU1.valid) {
            console.log('Invalid Sale: SKU1 Invalid');
            this.setState({ submitDisabledReason: 'Invalid SKU 1' });
            return this.setState({ submitDisabled: true });
        }

        if (saledata.SKU2.sku !== "" && !saledata.SKU2.valid) {
            console.log('Invalid Sale: SKU2 Invalid');
            this.setState({ submitDisabledReason: 'Invalid SKU 2' });
            return this.setState({ submitDisabled: true });
        }

        if (saledata.SKU3.sku !== "" && !saledata.SKU3.valid) {
            console.log('Invalid Sale: SKU3 Invalid');
            this.setState({ submitDisabledReason: 'Invalid SKU 3' });
            return this.setState({ submitDisabled: true });
        }

        if (saledata.SKU4.sku !== "" && !saledata.SKU4.valid) {
            console.log('Invalid Sale: SKU4 Invalid');
            this.setState({ submitDisabledReason: 'Invalid SKU 4' });
            return this.setState({ submitDisabled: true });
        }

        if (saledata.SKU5.sku !== "" && !saledata.SKU5.valid) {
            console.log('Invalid Sale: SKU5 Invalid');
            this.setState({ submitDisabledReason: 'Invalid SKU 5' });
            return this.setState({ submitDisabled: true });
        }

        //Check revenue
        if (saledata.revenue === 0) {
            console.log('Invalid Sale: Zero Revenue');
            this.setState({ submitDisabledReason: 'Zero revenue sales cannot be submitted' });
            return this.setState({ submitDisabled: true });
        }

        //All data valid
        this.setState({ submitDisabledReason: '', submitDisabled: false });
    }

    render() {

        const { loading, error, date, adviser, transactionID, orderNumber, type, revenue, SKU1, SKU2, SKU3, SKU4, SKU5, submitDisabled, submitDisabledReason } = this.state;
        const { kpinew, upg, payg, hbbnew, hbbupg, ins, ciot, tech, bus, ent } = this.state.kpis;

        return (
            <>
                <h1>New Sale</h1>
                <h3>{error}</h3>
                <h3>{submitDisabledReason === 'Initial State' ? '' : submitDisabledReason}</h3>
                {loading ? <img src={loadinggif} alt='loading gif' style={{ width: 150 }}></img> : ''}
                <form encType="multipart/form-data">
                    <input type='file' name='receiptdata' onChange={this.onChange} />
                    <label htmlFor='saves'>Saves =&gt;</label>
                    <input type='checkbox' name='saves' onChange={this.onChange} />
                    <label htmlFor='business'>Business =&gt;</label>
                    <input type='checkbox' name='business' onChange={this.onChange} />
                    <button onClick={this.onSubmit} disabled={submitDisabled}>Submit</button>
                </form>

                <form>
                    <label htmlFor='adviser'>Adviser</label><br />
                    <input type='text' name='adviser' value={adviser} onChange={this.onChange} /><br />
                    <label htmlFor='date'>Order Date</label><br />
                    <input type='date' name='date' value={date} onChange={this.onChange} /><br />
                    <label htmlFor='transactionID'>Transaction ID</label><br />
                    <input type='text' name='transactionID' value={transactionID} onChange={this.onChange} /><br />
                    <label htmlFor='orderNumber'>Order Number</label><br />
                    <input type='text' name='orderNumber' value={orderNumber} onChange={this.onChange} /><br />
                    <label htmlFor='type'>Sale Type</label><br />
                    <select name='type' value={type} onChange={this.onChange}>
                        <option>New</option>
                        <option>Upgrade</option>
                        <option>HBB</option>
                        <option>CIOT</option>
                        <option>Accessories</option>
                        <option>Tech</option>
                    </select><br />
                    <label htmlFor='kpinew'>New</label><br />
                    <button name='kpinew-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{kpinew}</label><button name='kpinew-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpiupg'>Upg</label><br />
                    <button name='upg-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{upg}</label><button name='upg-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpipayg'>PAYG</label><br />
                    <button name='payg-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{payg}</label><button name='payg-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpihbbnew'>HBBNew</label><br />
                    <button name='hbbnew-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{hbbnew}</label><button name='hbbnew-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpihbbupg'>HBBUpg</label><br />
                    <button name='hbbupg-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{hbbupg}</label><button name='hbbupg-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpiins'>INS</label><br />
                    <button name='ins-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{ins}</label><button name='ins-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpiciot'>CIOT</label><br />
                    <button name='ciot-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{ciot}</label><button name='ciot-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpitech'>Tech</label><br />
                    <button name='tech-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{tech}</label><button name='tech-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpibus'>Bus</label><br />
                    <button name='bus-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{bus}</label><button name='bus-up' onClick={this.kpiButton}>+</button><br />
                    <label htmlFor='kpient'>Ent</label><br />
                    <button name='ent-down' onClick={this.kpiButton}>-</button><label className='kpiLabelDisplay'>{ent}</label><button name='ent-up' onClick={this.kpiButton}>+</button><br />

                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Rev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type='text' name={'SKU1'} value={SKU1?.sku} onChange={this.onChange} /></td>
                                <td>{SKU1.type}</td>
                                <td>{SKU1.description}</td>
                                <td>{SKU1.rev}</td>
                            </tr>
                            <tr>
                                <td><input type='text' name={'SKU2'} value={SKU2?.sku} onChange={this.onChange} /></td>
                                <td>{SKU2?.type}</td>
                                <td>{SKU2?.description}</td>
                                <td>{SKU2?.rev}</td>
                            </tr>
                            <tr>
                                <td><input type='text' name={'SKU3'} value={SKU3?.sku} onChange={this.onChange} /></td>
                                <td>{SKU3?.type}</td>
                                <td>{SKU3?.description}</td>
                                <td>{SKU3?.rev}</td>
                            </tr>
                            <tr>
                                <td><input type='text' name={'SKU4'} value={SKU4?.sku} onChange={this.onChange} /></td>
                                <td>{SKU4?.type}</td>
                                <td>{SKU4?.description}</td>
                                <td>{SKU4?.rev}</td>
                            </tr>
                            <tr>
                                <td><input type='text' name={'SKU5'} value={SKU5?.sku} onChange={this.onChange} /></td>
                                <td>{SKU5?.type}</td>
                                <td>{SKU5?.description}</td>
                                <td>{SKU5?.rev}</td>
                            </tr>
                        </tbody>
                    </table>
                    <label htmlFor='revenue'>Total Revenue</label><br />
                    <label>£{revenue}</label><br />
                </form>
            </>
        )
    }
}


const NewSalePage = compose(
    withRouter,
    withFirebase,
)(NewSaleForm);

export { NewSaleForm };

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(NewSalePage);