import React, { useState } from 'react';
import { postsale } from '../API/sale-handler'
import loadinggif from './loadinggif.gif'

const NewSalePage = () => {

    const [image, setImage] = useState(null);
    const [saledata, setSaleData] = useState(undefined);
    const [skus, setSKUs] = useState([]);
    const [loadingSale, setLoadingSale] = useState(false);
    const [error, setError] = useState(null);

    const changeHandler = (event) => {
        switch (event.target.name) {
            case 'receiptdata':
                setImage(event.target.files[0]);
                break
            case 'skus':
                setSKUs(event.target.value);
                break
            default:
                break
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoadingSale(true);
        postsale(image)
            .then(data => {
                setLoadingSale(false);
                if(data.message && data.message === 'Request has unsupported document format'){
                    setError('Unsupported file type');
                } else {
                    setSaleData(data);
                    const skusDisplay = (
                    <ul>
                        {data.skus.map(sku => (
                            <li>{sku.sku} {sku.rev}</li>
                        ))}
                    </ul>
                    );
                    setSKUs(skusDisplay);
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <>
            <h1>New Sale</h1>
            <form encType="multipart/form-data">
                <input type='file' name='receiptdata' onChange={event => changeHandler(event)} />
                <button onClick={event => handleSubmit(event)}>Submit</button>
                {loadingSale ? <img src={loadinggif} alt='loading gif'></img> : ''}
            </form>

            <form>
                <label htmlFor='salesadvisor'>Adviser</label><br />
                <input type='text' name='salesadvisor' value={saledata?.adviser} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='orderdate'>Order Date</label><br />
                <input type='text' name='orderdate' value={saledata?.date} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='transactionid'>Transaction ID</label><br />
                <input type='text' name='transactionid' value={saledata?.transactionID} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='ordernumber'>Order Number</label><br />
                <input type='text' name='ordernumber' value={saledata?.orderNumber} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='saletype'>Sale Type</label><br />
                <input type='text' name='saletype' value={saledata?.type} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='totalrev'>Total Revenue</label><br />
                <input type='text' name='totalrev' value={saledata?.revenue} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpinew'>KPI New</label><br />
                <input type='text' name='kpinew' value={saledata?.kpis?.new} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpiupg'>KPI Upg</label><br />
                <input type='text' name='kpipayg' value={saledata?.kpis?.upg} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpipayg'>KPI PAYG</label><br />
                <input type='text' name='kpinew' value={saledata?.kpis?.payg} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpihbbnew'>KPI HBBNew</label><br />
                <input type='text' name='kpihbbnew' value={saledata?.kpis?.hbbnew} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpihbbupg'>KPI HBBUpg</label><br />
                <input type='text' name='kpihbbupg' value={saledata?.kpis?.hbbupg} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpiins'>KPI INS</label><br />
                <input type='text' name='kpiins' value={saledata?.kpis?.ins} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpiciot'>KPI CIOT</label><br />
                <input type='text' name='kpiciot' value={saledata?.kpis?.ciot} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpitech'>KPI Tech</label><br />
                <input type='text' name='kpitech' value={saledata?.kpis?.tech} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpibus'>KPI Bus</label><br />
                <input type='text' name='kpibus' value={saledata?.kpis?.bus} onChange={event => changeHandler(event)} /><br />
                <label htmlFor='kpient'>KPI Ent</label><br />
                <input type='text' name='kpient' value={saledata?.kpis?.ent} onChange={event => changeHandler(event)} /><br />
                {skus ? skus : ''}
            </form>
            <p>{error}</p>
        </>
    )
}


export default NewSalePage;