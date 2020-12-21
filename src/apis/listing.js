import config from '../config';
import Axios from 'axios';
import { getUserToken, getSessionGuid } from '../utils/session';

export const getRestaurantInfo = (id, signed) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        const newAxios = signed ? Axios.get(`${config.viewURL}?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }) : Axios.get(`${config.viewURL}?id=${id}`)
        newAxios.then(res => {
            if (res.data) {
                const restaurantInfo = res.data;
                resolve({restaurantInfo: restaurantInfo})
            } else {
                resolve({restaurantInfo: null, error: 'Ooops!, The restaurant is not exist.'});
            }
        }).catch(error => {
            resolve({restaurantInfo: null, error: error.toString()});
        })
    })
}

export const getReviews = (id) => {
    return new Promise((resolve, reject) => {
        Axios.get(`${config.reviewURL}?listing_id=${id}`).then(res => {
            if (res.data.reviews) {
                resolve(res.data.reviews)
            } else {
                resolve([])
            }
        }).catch (error => {
            resolve([])
        })
    })
}

export const getCategories = () => {
    return new Promise((resolve, reject) => {
        Axios.get(config.categoriesURL).then(res => {
            if (res.data && Array.isArray(res.data)) {
                resolve(res.data)
            } else {
                resolve([])
            }
        }).catch (error => {
            resolve([])
        })
    })
}

export const getDiets = () => {
    return new Promise((resolve, reject) => {
        Axios.get(config.dietsURL).then(res => {
            if (res.data && Array.isArray(res.data)) {
                resolve(res.data)
            } else {
                resolve([])
            }
        }).catch (error => {
            resolve([])
        })
    })
}

export const getCollections = () => {
    return new Promise((resolve, reject) => {
        Axios.get(config.collectionURL).then(res => {
            if (res.data){
                resolve(res.data)
            } else {
                resolve([])
            }
        }).catch(error => {
            resolve([])
        })
    })
}

export const explore = (url) => {
    return new Promise((resolve, reject) => {
        Axios.get(url).then(res => {
            if (res.data.collections && Array.isArray(res.data.collections)){
                resolve(res.data.collections)
            } else if (res.data.listings && Array.isArray(res.data.listings)) {
                resolve(res.data)
            }
        }).catch(error => {
            resolve([])
        })
    })
}

export const globalSearch = (s, geoHash) => {
    return new Promise((resolve, reject) => {
        Axios.get(`${config.searchURL}?geohash=${geoHash}&query=${s}`).then(res => {
            resolve(res.data)
        }).catch(error => {
            resolve({
                listings: [],
                collections: []
            })
        })
    })
}

export const addFavorite = (id) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'post',
            url: config.addFavoriteURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            data: {
                id: id
            }
        }).then(res => {
            if (res.data.success) {
                resolve(true)
            } else {
                reject(res.data.message)
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const getGeoHash = (location) => {
    return new Promise(async (resolve, reject) => {
        const sessId = await getSessionGuid();
        Axios.post(config.geoHashURL, {
            session_guid: sessId,
            location: {
                lat: location.latitude.toString(),
                lng: location.longitude.toString()
            }
        }).then(res => {
            resolve(res.data)
        }).catch(error => {
            console.log("ceebo-log-error", error)
            resolve(null)
        })
    })
}

export const getProductItems = (id) => {
    return new Promise((resolve, reject) => {
        Axios.get(config.productItemURL + "?id=" + id)
        .then(res => {
            resolve(res.data)
        }).catch(error => {
            resolve(null)
        })
    })
}

export const getFavorites = () => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: `${config.favoriteURL}`,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        }).then(res => {
            resolve(res.data)
        }).catch(error => {
            resolve([])
        })
    })
}