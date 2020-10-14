import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
} from 'react-native';

import RNPickerSelect from 'react-native-picker-select';

export default class FilterMultiPicker extends React.Component {

    static propTypes = {
        filterSelect: PropTypes.array.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            selectVal: ''
        }
    }

    render() {

        const {
            filterSelects
        } = this.props;

        return (
            <View>
                <RNPickerSelect onValueChange={value => {
                    this.setState({selectVal: value})
                }} items={filterSelects}/>
            </View>
        );
    }
}