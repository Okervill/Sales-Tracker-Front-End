import React, { useState } from 'react';
import { postsale } from '../API/sale-handler'

const NewSalePage = () => {

    const [image, setImage] = useState(null)
    const [saledata, setSaleData] = useState({})
    const [adviser, setAdivser] = useState('')
    const [skus, setSKUs] = useState([])

    const changeHandler = (event) => {
        switch (event.target.name) {
            case 'receiptdata':
                setImage(event.target.files[0])
                break
            case 'salesadvisor':
                setAdivser(event.target.value);
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
        postsale(image)
            .then(data => {
                setSaleData(data)
                setAdivser(data.adviser)
                setSKUs(data.skus)
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
            </form>

            <form>
                <label htmlFor='salesadvisor'>Adviser</label>
                <input type='text' name='salesadvisor' value={adviser} onChange={event => changeHandler(event)} />
                <label htmlFor='skus'>SKUs</label>
                <input type='text' name='skus' value={skus} onChange={event => changeHandler(event)} />
            </form>
            <p>{JSON.stringify(saledata)}</p>
        </>
    )
}


export default NewSalePage;