import axios from 'axios';

export const postsale = (token, saledata, saleskus) => {
    return new Promise(async (resolve, reject) => {
        let form_data = new FormData();
        form_data.append('saledata', JSON.stringify(saledata))
        form_data.append('saleskus', JSON.stringify(saleskus))
        let url = 'https://api.albayan.io/post/sale';
        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data',
                'authToken': token
            }
        })
        .catch(err => console.error(err))
            .then(res => {
                return resolve(res.data)
            })
            .catch(err => { return reject(err) })
    });
}

export const getReceiptData = (token, image, uid) => {
    return new Promise(async (resolve, reject) => {

        let form_data = new FormData();
        form_data.append('receiptdata', image)
        form_data.append('uid', uid)
        let url = 'https://api.albayan.io/post/receipt';
        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data',
                'authToken': token
            }
        })
            .then(res => {
                return resolve(res.data)
            })
            .catch(err => { return reject(err) })
    });
}

export const getsales = (token, uid) => {
    return new Promise(async (resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }
        let url = `https://api.albayan.io/get/usersales/${uid}`;
        axios.get(url, config, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
            .then(res => {
                return resolve(res.data)
            })
            .catch(err => { return reject(err) })
    })
}

export const getsku = (token, sku) => {
    return new Promise(async (resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }
        let url = `https://api.albayan.io/get/sku/${sku}`;
        axios.get(url, config)
            .then(response => {
                if (response.status !== 200 && response.status !== "200") {
                    return reject();
                }
                return resolve(response.data);
            })
    })
}