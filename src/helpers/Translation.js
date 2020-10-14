import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import PropTypes from 'prop-types';
import {EventRegister} from 'react-native-event-listeners';
import _ from 'lodash';

let _this;
let translationObj = {};

export default class Translation extends React.Component {

    static propTypes = {
        str: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            refresh: false
        }
    }

    async componentWillMount() {
        let translations = await AsyncStorage.getItem('translations');
        translationObj = JSON.parse(translations);
        _this.setState({
            refresh: true
        });

        _this.listener = EventRegister.addEventListener('refreshTranslation', (data) => {
            _this.refreshTranslations(data);
        })
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(_this.listener);
    }

    refreshTranslations = (data) => {
        translationObj = JSON.parse(data);

        _this.setState({
            refresh: true
        })
    }

    _getTranslation = (string) => {

        let str = 'No translation';
        if(translationObj.hasOwnProperty(string)) {
            str = _.get(translationObj, string);
        }

        return str;
    }

    render() {
        const {str} = this.props;

        return (_this._getTranslation(str));
    }
}