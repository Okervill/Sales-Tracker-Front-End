import axios from 'axios';

export const postsale = (image, uid) => {
    return new Promise(async (resolve, reject) => {
        let form_data = new FormData();
        form_data.append('receiptdata', image)
        form_data.append('uid', uid)
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

export const getsales = (uid) => {
    return new Promise(async (resolve, reject) => {
        let form_data = new FormData();
        form_data.append('uid', uid);
        let url = 'https://api.albayan.io/usersales/get';
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
    })
}