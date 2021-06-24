import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';
import { withAuthorisation } from '../Session';
import { getReceiptData, postsale } from '../API/sale-handler';
import { compose } from 'recompose';
import loadinggif from './loadinggif.gif';

const INITIALSTATE = {
    loading: false,
    error: null,
    receiptdata: undefined,
    adviser: '',
    date: '',
    transactionID: '',
    orderNumber: '',
    skus: {},
    type: '',
    revenue: '',
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
    skusDisplay: (<><input></input> <label>SKU Description</label></>)
}

class NewSaleForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            currentUser: JSON.parse(localStorage.getItem('authUser')),
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
        } else {
            this.setState({ [event.target.name]: event.target.value })
        }
    }

    getImageData(token) {
        this.setState({ loading: true });
        const { receiptdata } = this.state;
        getReceiptData(token, receiptdata, this.props.firebase.auth.currentUser.uid)
            .then(data => {
                this.setState({ loading: false });
                if (data.message && data.message === 'Request has unsupported document format') {
                    this.setState({ error: 'Unsupported file type' });
                } else {
                    if (data.type === '' && data.skus.length === 1) {
                        data.type = data.skus[0].type;
                    }
                    this.setState({ ...data });
                    const skusDisplay = (
                        <ul>
                            {data.skus.map(sku => (
                                <>
                                    <label key={sku.sku}>{sku.sku} {sku.description} {sku.rev}</label>
                                </>
                            ))}
                        </ul>
                    );
                    this.setState({ skusDisplay });
                }
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
            new: this.state.kpis.new,
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

        this.props.firebase.auth.currentUser.getIdToken()
            .then(token => {
                console.log(saledata);
                console.log(saleskus);
                postsale(token, saledata, saleskus);
            })
    }

    render() {

        const { skusDisplay, loading, error, date, adviser, transactionID, orderNumber, type, revenue } = this.state;
        const { kpinew, upg, payg, hbbnew, hbbupg, ins, ciot, tech, bus, ent } = this.state.kpis;

        return (
            <>
                <h1>New Sale</h1>
                <p>{error}</p>
                <form encType="multipart/form-data">
                    <input type='file' name='receiptdata' onChange={this.onChange} />
                    <button onClick={this.onSubmit}>Submit</button>
                    {loading ? <img src={loadinggif} alt='loading gif'></img> : ''}
                </form>

                <form>
                    <label htmlFor='adviser'>Adviser</label><br />
                    <input type='text' name='adviser' value={adviser} onChange={this.onChange} /><br />
                    <label htmlFor='date'>Order Date</label><br />
                    <input type='text' name='date' value={date} onChange={this.onChange} /><br />
                    <label htmlFor='transactionID'>Transaction ID</label><br />
                    <input type='text' name='transactionID' value={transactionID} onChange={this.onChange} /><br />
                    <label htmlFor='orderNumber'>Order Number</label><br />
                    <input type='text' name='orderNumber' value={orderNumber} onChange={this.onChange} /><br />
                    <label htmlFor='type'>Sale Type</label><br />
                    <input type='text' name='type' value={type} onChange={this.onChange} /><br />
                    <label htmlFor='revenue'>Total Revenue</label><br />
                    <input type='text' name='revenue' value={revenue} onChange={this.onChange} /><br />
                    <label htmlFor='kpinew'>KPI New</label><br />
                    <input type='text' name='kpinew' value={kpinew} onChange={this.onChange} /><br />
                    <label htmlFor='kpiupg'>KPI Upg</label><br />
                    <input type='text' name='kpiupg' value={upg} onChange={this.onChange} /><br />
                    <label htmlFor='kpipayg'>KPI PAYG</label><br />
                    <input type='text' name='kpipayg' value={payg} onChange={this.onChange} /><br />
                    <label htmlFor='kpihbbnew'>KPI HBBNew</label><br />
                    <input type='text' name='kpihbbnew' value={hbbnew} onChange={this.onChange} /><br />
                    <label htmlFor='kpihbbupg'>KPI HBBUpg</label><br />
                    <input type='text' name='kpihbbupg' value={hbbupg} onChange={this.onChange} /><br />
                    <label htmlFor='kpiins'>KPI INS</label><br />
                    <input type='text' name='kpiins' value={ins} onChange={this.onChange} /><br />
                    <label htmlFor='kpiciot'>KPI CIOT</label><br />
                    <input type='text' name='kpiciot' value={ciot} onChange={this.onChange} /><br />
                    <label htmlFor='kpitech'>KPI Tech</label><br />
                    <input type='text' name='kpitech' value={tech} onChange={this.onChange} /><br />
                    <label htmlFor='kpibus'>KPI Bus</label><br />
                    <input type='text' name='kpibus' value={bus} onChange={this.onChange} /><br />
                    <label htmlFor='kpient'>KPI Ent</label><br />
                    <input type='text' name='kpient' value={ent} onChange={this.onChange} /><br />
                    {skusDisplay ? skusDisplay : ''}
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