import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Platform,
    StyleSheet,
} from 'react-native';

import Ico from './Ico';
import RNPickerSelect from 'react-native-picker-select';
import GLOBAL from '../constants/globals';

export default class FilterSelect extends React.Component {

    static propTypes = {
        filterSelectOpt: PropTypes.array.isRequired,
        filterType: PropTypes.string.isRequired,
        filterPlaceholder: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            selectVal: ''
        }
    }

    _onSelect = (key, value) => {
        this.props._setFilterSelectParams(key, value);
    }

    render() {
        const {filterSelectOpt, filterType, filterPlaceholder} = this.props;
        return (
            <View style={pickerSelectStyles.wrap}>
                <RNPickerSelect
                    placeholder={{}}
                    useNativeAndroidPickerStyle={true}
                    onValueChange={value => {
                        this._onSelect(filterType, value);
                    }}
                    items={filterSelectOpt}
                    style={{
                        pickerSelectStyles,
                        iconContainer: {
                            ...Platform.select({
                                ios: {
                                    top: 0,
                                    right: 0,
                                },
                                android: {
                                    top: 18,
                                    right: 10,
                                }
                            }),
                        }
                    }}

                    Icon={() => {
                        return <Ico icoName='lnr-chevron-down' icoColor={GLOBAL.COLOR.gray88} icoSize={16} />;
                    }}
                />
            </View>
        );
    }
}

const pickerSelectStyles = StyleSheet.create({
    wrap: {
        ...Platform.select({
            ios: {
                paddingVertical: 15,
                paddingHorizontal: 10,
            },
            android: {
                minHeight: 40,
                paddingLeft: 10
            }
        }),

    },

    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        minHeight: '40'
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#ededed',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        minHeight: '40'
    },
});