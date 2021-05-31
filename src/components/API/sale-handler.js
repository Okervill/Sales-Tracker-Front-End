import axios from 'axios';

export const postsale = (image) => {
    return new Promise(async (resolve, reject) => {
        console.log('post submitted')
        let form_data = new FormData();
        form_data.append('receiptdata', image)
        let url = 'https://api.albayan.io/sale/post';
        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
            .then(res => {
                console.log(res.data)
                return resolve(res.data)
            })
            .catch(err => { return reject(err) })
    });
}