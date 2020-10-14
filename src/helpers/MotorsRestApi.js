import SETTINGS from './settings';

export const getSettings = (acv) => {
    return fetch(SETTINGS.REST_URL + '/settings/?acv=' + acv, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getMainPage = () => {
    return fetch(SETTINGS.REST_URL + '/main-page/', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getRecentLoadMore = (offset, limit) => {
    return fetch(SETTINGS.REST_URL + '/recent-load-more/?offset=' + offset + '&limit=' + limit, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getListings = () => {

    return fetch(SETTINGS.REST_URL + '/listings/', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getListing = (params) => {

    return fetch(SETTINGS.REST_URL + '/listing/?' + params, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getUser = (id) => {

    return fetch(SETTINGS.REST_URL + '/user/' + id, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getLogedUser = (id) => {

    return fetch(SETTINGS.REST_URL + '/private-user/' + id, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getFilter = () => {

    return fetch(SETTINGS.REST_URL + '/filter/', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getFeatured = () => {

    return fetch(SETTINGS.REST_URL + '/featured/', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getLocationName = (lat, lng, apiKey) => {
    return fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + lat + ',' + lng + '&key=' + apiKey, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const getFilteredListings = (params) => {
    return fetch(SETTINGS.REST_URL + '/filtered-listings?' + params, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const doLogin = (params) => {
    return fetch(SETTINGS.REST_URL + '/login/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
        body: params
    })
        .then((response) => response.json());
}

export const doRegistration = (params) => {
    return fetch(SETTINGS.REST_URL + '/registration/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
        body: params
    })
        .then((response) => response.json());
}

export const updateProfile = (params) => {
    return fetch(SETTINGS.REST_URL + '/update-profile?', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
        body: params
    })
        .then((response) => response.json());
}

export const addACarParamms = () => {
    return fetch(SETTINGS.REST_URL + '/add-car/', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const addACar = (formData) => {
    return fetch(SETTINGS.REST_URL + '/add-a-car/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data;'
        },
        body: formData
    })
        .then((response) => response.json());
}

export const editACar = (formData) => {
    return fetch(SETTINGS.REST_URL + '/edit-car/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data;'
        },
        body: formData
    })
        .then((response) => response.json());
}

export const getEditCar = (id) => {

    return fetch(SETTINGS.REST_URL + '/get-edit-car/' + id, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json());
}

export const deleteACar = (formData) => {
    return fetch(SETTINGS.REST_URL + '/delete-car/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data;'
        },
        body: formData
    })
        .then((response) => response.json());
}

export const addACarUploadMedia = (formData) => {
    return fetch(SETTINGS.REST_URL + '/upload-media/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data;'
        },
        body: formData
    })
        .then((response) => response.json());
}

export const loadMore = (params) => {
    return fetch(SETTINGS.REST_URL + '/priv-prof-load-more/?' + params, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then((response) => response.json());
}

export const loadMoreFavourites = (params) => {
    return fetch(SETTINGS.REST_URL + '/priv-prof-load-more-fav/?' + params, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then((response) => response.json());
}

export const actionWithFavorite = (formData) => {
    return fetch(SETTINGS.REST_URL + '/action-with-favorite/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data;'
        },
        body: formData
    })
        .then((response) => response.json());
}

export const removeFromFavorite = (formData) => {
    return fetch(SETTINGS.REST_URL + '/remove-from-favorite/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data;'
        },
        body: formData
    })
        .then((response) => response.json());
}