import axios from 'axios';

export const postsale = (image) => {
    return new Promise(async (resolve, reject) => {
        console.log('post submitted')
        let form_data = new FormData();
        form_data.append('image', image)
        let url = 'http://api.vodasales.com/sale/post';
        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
            .then(res => {
                console.log(res)
                return resolve(res)
            })
            .catch(err => { return reject(err) })
    });
}