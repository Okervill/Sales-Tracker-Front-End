import axios from 'axios';
import moment from 'moment';

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
            .catch(err => {
                return reject(err)
            })
    });
}

export const getReceiptData = (token, image, uid, defaultstore) => {
    return new Promise(async (resolve, reject) => {

        let form_data = new FormData();
        form_data.append('receiptdata', image);
        form_data.append('uid', uid);
        form_data.append('defaultstore', defaultstore);
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
            .catch(err => {
                return reject(err)
            })
    });
}

export const getsales = (token, uid, startDate, endDate) => {
    return new Promise(async (resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }
        let url = `https://api.albayan.io/get/usersales/${uid}/${startDate}/${endDate}`;
        axios.get(url, config, {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            })
            .then(res => {
                return resolve(res.data)
            })
            .catch(err => {
                return reject(err)
            })
    })
}

export const getsku = (token, storecode, sku) => {
    return new Promise(async (resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }
        let url = `https://api.albayan.io/get/sku/${storecode}/${sku}`;
        axios.get(url, config)
            .then(response => {
                if (response.status !== 200 && response.status !== "200") {
                    return reject(response);
                }
                return resolve(response.data);
            })
    })
}

export const postRateCard = (token, storecode, ratecardname, ratecardfile) => {
    return new Promise(async (resolve, reject) => {

        let form_data = new FormData();
        form_data.append('ratecard', ratecardfile);
        form_data.append('storecode', storecode);
        form_data.append('ratecardname', ratecardname);
        let url = 'https://api.albayan.io/post/ratecard';
        axios.post(url, form_data, {
                headers: {
                    'content-type': 'multipart/form-data',
                    'authToken': token
                }
            })
            .then(res => {
                return resolve(res.data)
            })
            .catch(err => {
                return reject(err)
            })
    });
}

export const getRateCards = (token, storecode) => {
    return new Promise((resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }
        let url = `https://api.albayan.io/get/ratecards/${storecode}`;
        axios.get(url, config)
            .then(response => {
                if (response.status !== 200 && response.status !== "200") {
                    return reject(response);
                }
                return resolve(response.data);
            })

    })
}

export const disableUser = (token, uid) => {
    return new Promise(async (resolve, reject) => {

        let form_data = new FormData();
        form_data.append('uid', JSON.stringify(uid));
        let url = 'https://api.albayan.io/users/disable';
        axios.post(url, form_data, {
                headers: {
                    'content-type': 'multipart/form-data',
                    'authToken': token
                }
            })
            .then(res => {
                return resolve(res.data)
            })
            .catch(err => {
                return reject(err)
            })

    });
}

export const createUser = (token, userdata) => {
    return new Promise((resolve, reject) => {

        let form_data = new FormData();
        form_data.append('userdata', JSON.stringify(userdata));
        let url = 'https://api.albayan.io/users/create';

        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data',
                'authToken': token
            }
        }).then(res => {
            return resolve(res.data);
        }).catch(err => {
            return reject(err);
        })

    })
}

export const activateRatecard = (token, tablename) => {
    return new Promise((resolve, reject) => {

        let form_data = new FormData();
        form_data.append('tablename', tablename);
        let url = 'https://api.albayan.io/ratecards/activate';

        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data',
                'authToken': token
            }
        }).then(res => {
            return resolve(res.data);
        }).catch(err => {
            return reject(err);
        })

    })
}

export const getStoreSales = (token, storecode, startdate, enddate) => {
    return new Promise((resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }
        let url = `https://api.albayan.io/get/storesales/${storecode}/${startdate}/${enddate}`;
        axios.get(url, config)
            .then(response => {
                if (response.status !== 200 && response.status !== "200") {
                    return reject(response);
                }
                return resolve(response.data);
            })

    })
}

export const getStoreTargets = (token, storecode, date) => {
    return new Promise((resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }

        let isValid = moment(date, 'YYYY-MM-DD', true).isValid();
        if (!isValid) {
            return reject('Invalid date');
        }

        let url = `https://api.albayan.io/get/storetargets/${storecode}/${date}`;
        axios.get(url, config)
            .then(response => {
                if (response.status !== 200 && response.status !== "200") {
                    return reject(response);
                }
                return resolve(response.data);
            })

    })
}

export const setStoreTargets = (token, targets) => {
    return new Promise((resolve, reject) => {

        let form_data = new FormData();
        form_data.append('targets', JSON.stringify(targets));
        let url = 'https://api.albayan.io/post/targets';

        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data',
                'authToken': token
            }
        }).then(res => {
            return resolve(res.data);
        }).catch(err => {
            return reject(err);
        })

    })
}

export const getStaffTargets = (token, storecode, date, uid) => {
    return new Promise((resolve, reject) => {

        let config = {
            headers: {
                authToken: token,
            }
        }

        let isValid = moment(date, 'YYYY-MM-DD', true).isValid();
        if (!isValid) {
            return reject('Invalid date');
        }

        let url = `https://api.albayan.io/get/stafftargets/${storecode}/${date}/${uid}`;
        axios.get(url, config)
            .then(response => {
                if (response.status !== 200 && response.status !== "200") {
                    return reject(response);
                }
                return resolve(response.data);
            })

    })
}

export const setStaffTargets = (token, targets, storecode, date) => {
    return new Promise((resolve, reject) => {

        let form_data = new FormData();
        form_data.append('targets', JSON.stringify(targets));
        form_data.append('date', JSON.stringify(date));
        form_data.append('storecode', JSON.stringify(storecode));
        let url = 'https://api.albayan.io/post/stafftargets';

        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data',
                'authToken': token
            }
        }).then(res => {
            return resolve(res.data);
        }).catch(err => {
            return reject(err);
        })

    })
}