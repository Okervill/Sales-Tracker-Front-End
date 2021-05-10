import React, { useState } from 'react';
import { postsale } from '../API/sale-handler'

const NewSalePage = () => {

    const [image, setImage] = useState(null)
    const [saledata, setSaleData] = useState('')

    const changeHandler = (event) => {
        setImage(event.target.files[0])
    }

    const handleSubmit = (event) => {
        postsale(image)
            .then(data => {
                setSaleData(data)
            })
            .catch(err => {
                console.error(err)
            })
    }

    return (
        <>
            <h1>New Sale</h1>
            <form encType="multipart/form-data">
                <input type='file' name='receiptdata' onChange={event => changeHandler(event)} />
                <button onClick={event => handleSubmit(event)}>Submit</button>
            </form>
            {saledata}
        </>
    )
}


export default NewSalePage;