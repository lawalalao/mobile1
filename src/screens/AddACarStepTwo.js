import React from 'react';
import {
    ScrollView,
    View,
    Dimensions,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import {EventRegister} from 'react-native-event-listeners';
import Ico from '../components/Ico';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import Toast, {DURATION} from 'react-native-easy-toast'
import {getLocationName, getLatLong, addACar, addACarUploadMedia, editACar} from "../helpers/MotorsRestApi";
import _ from 'lodash';


const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let addACarData = {};
let validateFields = {};

export default class AddACarStepTwo extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            isLoading: true,
            refreshing: false,
            forceRefresh: false,
            load: false,
            stepTwo: {},
            stepThree: {},
            locationName: '',
            featured: {},
            apiKeyAndroid: '',
            apiKeyIos: '',
            additional_key: 'stm_additional_features',
            currency: '',
            currencyName: '',
            editMode: false,
            resetAll: false,
            mainColor: '',
            secondColor: '',
            priceEmpty: false
        }
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            headerStyle: {
                height: 50,
                borderBottomWidth: 0,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 5,
            },
            headerTitle: (
                <View style={styles.appMainTitle}>
                    <Text style={styles.main_center}><Translation str='build_your_ad'/></Text>
                    <Text style={styles.center}><Translation str='step_2'/></Text>
                </View>
            ),
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        navigation.goBack()
                    }}>
                        <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={14}/>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: (
                <TouchableOpacity
                    activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                    _this._btnAdditionalOnPress()
                }}>
                    <View>
                        <Ico icoName='arrow-right1' icoColor={GLOBALS.COLOR.gray88} icoSize={14}/>
                    </View>
                </TouchableOpacity>),
        }
    };

    _showToast = (text, color) => {
        _this.refs['toast'].show(text, 3000);
    }

    findCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                let coord = position.coords;

                if (coord.latitude != 0 && coord.longitude != 0) {
                    addACarData['stm_lat'] = coord.latitude;
                    addACarData['stm_lng'] = coord.longitude;

                    getLocationName(coord.latitude, coord.longitude, _this.state.apiKeyAndroid).then((responseJson) => {
                        if (responseJson.hasOwnProperty('results') && responseJson.results.length > 0) {
                            addACarData['stm_location_text'] = responseJson.results[0].formatted_address;
                            _this.setState({locationName: responseJson.results[0].formatted_address});
                        }
                    }, function () {
                    })
                }
            },
            error => {
                _this._showToast(error.message);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );
    };

    _validateFieldsMaping = () => {
        let valid = (addACarData.hasOwnProperty('stm_car_price')) ? true : false;

        validateFields['price'] = valid;
    }

    async componentWillMount() {


        let mc = '';
        let sc = '';
        try {
            mc = await AsyncStorage.getItem('main_color');
            sc = await AsyncStorage.getItem('secondary_color');
        } catch (e) {
            console.log("error from AsyncStorage Colors: ", e);
        }

        let apiKeyAndr = '';
        let apiKeyIos = '';
        if (_this.props.navigation.state.params.step_two.hasOwnProperty('location')) {
            try {
                apiKeyAndr = await AsyncStorage.getItem('apiKeyAndroid');
                apiKeyIos = await AsyncStorage.getItem('apiKeyIos');
            } catch (e) {
                console.log("error from AsyncStorage Add A Car Two: ", e);
            }
        }


        let currency = '';
        let currencyName = '';
        try {
            currency = await AsyncStorage.getItem('currency');
            currencyName = await AsyncStorage.getItem('currency_name');
        } catch (e) {
            console.log("error from AsyncStorage Add A Car Two: ", e);
        }

        _this.listener = EventRegister.addEventListener('resetAddACar', (data) => {
            addACarData = {};
            _this.setState({
                resetAll: true
            })
        })

        addACarData = _this.props.navigation.state.params.add_car_data;

        _this.setState({
            isLoading: false,
            refreshing: false,
            stepTwo: _this.props.navigation.state.params.step_two,
            stepThree: _this.props.navigation.state.params.step_three,
            editMode: _this.props.navigation.state.params.edit_mode,
            apiKeyAndroid: apiKeyAndr,
            apiKeyIos: apiKeyIos,
            currency: currency,
            currencyName: currencyName,
            mainColor: mc,
            secondColor: sc
        })

        _this._validateFieldsMaping();
        if (_this.props.navigation.state.params.step_two.hasOwnProperty('location')) {
            _this.findCoordinates();
        }
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(_this.listener);
    }

    componentDidMount() {}

    _setFilterSelectParams = (key, value) => {
        let k = (key != 'images') ? 'stm_s_s_' + key : key;
        addACarData[k] = value;
        //addACarData['stm_s_s_' + key] = value;
    }

    _btnOnPress = () => {

        if(validateFields.hasOwnProperty('price') && !validateFields['price']) {

            _this._showToast('Please enter Price');
            _this.setState({
                priceEmpty: true
            })

            return;
        }

        if (_this.state.load) return;

        _this.setState({
            load: true,
            priceEmpty: false
        })

        const formData = new FormData();

        let stm_car_main_title = '';
        _.map(addACarData, function (data, index) {
            if (index != 'images') {
                if (typeof (data) == 'object') {
                    let k = Object.keys(data);

                    if (index == 'stm_f_s_make') {
                        stm_car_main_title += data[k[0]];
                    }

                    if (index == 'stm_f_s_serie') {
                        stm_car_main_title += ' ' + data[k[0]];
                    }

                    if (k.length == 1) {
                        formData.append(index, k[0].toString())
                    } else {
                        _.map(data, function (val, key) {
                            formData.append(index + '[]', val)
                        })
                    }
                } else {
                    formData.append(index, data)
                }
            }
        })

        formData.append('stm_car_main_title', stm_car_main_title);

        if (!_this.state.editMode) {
            addACar(formData).then((responceJSON) => {
                _this._showToast(responceJSON.message);
                if (responceJSON.hasOwnProperty('code') && responceJSON.code != 403) {
                    _this._uploadImage(responceJSON.post_id);
                } else {
                    _this.setState({
                        load: false
                    })
                }
            })
                .catch(err => {
                    _this._showToast(err);
                    _this.setState({
                        load: false
                    })
                });
        } else {
            editACar(formData).then((responceJSON) => {
                _this._showToast(responceJSON.message);

                if(responceJSON.code != 403) {
                    _this._uploadImage(responceJSON.post_id);
                } else {
                    _this.setState({
                        load: false
                    })
                }
            })
                .catch(err => {
                    _this._showToast(err);
                    _this.setState({
                        load: false
                    })
                });
        }
    }

    _uploadImage = (post_id) => {
        if (addACarData.images) {
            _this._doUploadImg(0, post_id);
        } else {
            _this.setState({
                load: false
            })
        }
    }

    _doUploadImg = (pos, parentId) => {
        let countImgs = Object.keys(addACarData.images).length;

        let imgObj = addACarData.images[pos];

        const formData = new FormData();

        formData.append('user_id', addACarData.user_id);
        formData.append('user_token', addACarData.user_token);
        formData.append('post_id', parentId);

        if (_this.state.editMode) {
            formData.append('stm_edit', 'update');
        }

        let localUri = imgObj.src;

        formData.append('photo', localUri);
        formData.append('position', imgObj.position);
        formData.append('count', countImgs);

        if (imgObj.hasOwnProperty('img_id')) {
            formData.append('img_id', imgObj.img_id);
        }

        addACarUploadMedia(formData).then((responceJSON) => {

            if ((countImgs - 1) == pos) {
                _this._showToast(responceJSON.message);

                addACarData = {};

                _this.setState({
                    load: false
                });

                EventRegister.emit('resetAddACar', '');

                setTimeout(() => {
                    _this.props.navigation.replace('Profile');
                }, 1500)
            } else {
                _this._doUploadImg(parseInt(responceJSON.position) + 1, parentId);
            }
        })
            .catch(err => {
                _this._showToast(err);
                _this.setState({
                    load: false
                })
            });
    }

    _btnAdditionalOnPress = () => {
        _this.props.navigation.navigate('AddACarStepThree', {
            'add_car_data': addACarData,
            'step_three': _this.state.stepThree,
            'edit_mode': _this.state.editMode,
        });
    }

    _setCheckedFilterParams = (key, values) => {
        addACarData['stm_s_s_' + key] = values;
        _this.setState({
            refreshing: false
        })
    }

    _deleteFilterParam = (type, key) => {
        delete addACarData['stm_s_s_' + type][key];
        _this.setState({
            refreshing: false
        })
    }

    componentDidUpdate() {
    }

    render() {
        if (_this.state.isLoading) {
            return (<View style={{flex: 1, alignItems: 'center', paddingTop: 100}}><ActivityIndicator/></View>)
        }

        return (
            <KeyboardAvoidingView behavior={"padding"} style={{flex: 1, width: '100%'}}>
                <ScrollView>
                    <View>
                        {
                            _.map(_this.state.stepTwo, function (dataFilter, index) {
                                if(index.length > 0) {
                                    switch (index) {
                                        case 'seller_notes':
                                            return (
                                                <View key={index} style={styles.addMediaWrap}>
                                                    <Text style={styles.filterMediaLabel}><Translation str='seller_note'/></Text>
                                                    <View style={styles.textareaWrap}>
                                                        <TextInput underlineColorAndroid='transparent'
                                                                   multiline={true}
                                                                   style={styles.textarea}
                                                                   onChangeText={(text) => {
                                                                       addACarData['stm_seller_notes'] = text;
                                                                   }}
                                                                   defaultValue={(addACarData.hasOwnProperty('stm_seller_notes')) ? addACarData['stm_seller_notes'] : ''}
                                                        />
                                                    </View>
                                                </View>
                                            )
                                        case 'stm_additional_features':

                                            if (!addACarData.hasOwnProperty(_this.state.additional_key)) {
                                                addACarData[_this.state.additional_key] = {};
                                            }

                                            return (
                                                <View key={index}>
                                                    <FlatList
                                                        style={styles.flatStyle}
                                                        data={_this.state.stepTwo.stm_additional_features}
                                                        extraData={this.state}
                                                        renderItem={({item}) =>
                                                            <TouchableOpacity
                                                                activeOpacity={0.8} onPress={() => {
                                                                if (!addACarData[_this.state.additional_key].hasOwnProperty(item.slug)) {
                                                                    addACarData[_this.state.additional_key][item.slug] = item.label;
                                                                } else {
                                                                    delete addACarData[_this.state.additional_key][item.slug];
                                                                }

                                                                _this.setState({
                                                                    update: true
                                                                })
                                                            }}>
                                                                {
                                                                    (!addACarData[_this.state.additional_key].hasOwnProperty(item.slug)) ?
                                                                        <View style={styles.listItem}>
                                                                            <Text
                                                                                style={styles.title}>{item.label}</Text>
                                                                            <Text
                                                                                style={styles.count}>{item.count}</Text>
                                                                        </View>
                                                                        :
                                                                        <View style={styles.listItemBorder}>
                                                                            <Text
                                                                                style={styles.title}>{item.label}</Text>
                                                                            <View class={styles.checkWrap}>
                                                                                <Ico icoName='lnr-check' icoSize={16}
                                                                                     icoColor={_this.state.mainColor}/>
                                                                            </View>
                                                                        </View>
                                                                }
                                                            </TouchableOpacity>
                                                        }
                                                        keyExtractor={({item}, index) => index.toString()}
                                                    />
                                                </View>
                                            )
                                        case 'add_media':
                                            return (
                                                <View key={index} style={styles.addMediaWrap}>
                                                    <Text style={styles.filterMediaLabel}><Translation str='add_media'/></Text>
                                                    <View style={styles.mediaBtnsWrap}>
                                                        <View style={styles.photoBtn}>
                                                            <TouchableOpacity
                                                                activeOpacity={0.8} style={styles.mediaBtn}
                                                                onPress={() => {
                                                                    _this.props.navigation.navigate('AddACarChooseImage', {_setFilterSelectParams: _this._setFilterSelectParams})
                                                                }}>
                                                                <Ico icoName='add_media' icoSize={40}
                                                                     icoColor={GLOBALS.COLOR.grayAC}/>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={styles.videoBtn}>
                                                            <TouchableOpacity
                                                                activeOpacity={0.8} style={styles.mediaBtn}>
                                                                <Ico icoName='add_video' icoSize={40}
                                                                     icoColor={GLOBALS.COLOR.grayAC}/>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            )
                                        case 'make':
                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    activeOpacity={0.8} onPress={() => {
                                                    _this.props.navigation.navigate('AddACarMakeChoose', {
                                                        title: index,
                                                        checkedParams: addACarData,
                                                        filterType: index,
                                                        filterData: dataFilter,
                                                        _setCheckedFilterParams: _this._setCheckedFilterParams
                                                    })
                                                }}>
                                                    <View style={styles.multiPicker}>
                                                        <Text style={styles.filterLabel}><Translation str='make'/></Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (addACarData.hasOwnProperty('stm_s_s_make') && Object.keys(addACarData.stm_s_s_make).length > 0) ?
                                                                    _.map(addACarData['stm_s_s_make'], function (val, slug) {
                                                                        return (
                                                                            <TouchableOpacity
                                                                                activeOpacity={0.8} key={slug}
                                                                                onPress={() => {
                                                                                    _this._deleteFilterParam('make', slug)
                                                                                }}>
                                                                                <View style={styles.filterCheckedItem}>
                                                                                    <Text style={{
                                                                                        marginRight: 10,
                                                                                        fontSize: 12
                                                                                    }}>{val}</Text>
                                                                                    <Ico icoName='lnr-cross'
                                                                                         icoSize={12}
                                                                                         icoColor={GLOBALS.COLOR.title}/>
                                                                                </View>
                                                                            </TouchableOpacity>
                                                                        )
                                                                    })
                                                                    :
                                                                    <View style={styles.filterPlchldrItem}>
                                                                        <Text style={{
                                                                            fontSize: 14,
                                                                            color: '#9f9f9f'
                                                                        }}><Translation str='choose'/> {index}...</Text>
                                                                    </View>
                                                            }
                                                        </View>
                                                        <View style={styles.arrowMulti}>
                                                            <Ico icoName='lnr-chevron-right'
                                                                 icoColor={GLOBALS.COLOR.gray88}
                                                                 icoSize={16}/>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        case 'body':
                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    activeOpacity={0.8} onPress={() => {
                                                    _this.props.navigation.navigate('AddACarMakeChoose', {
                                                        title: index,
                                                        checkedParams: addACarData,
                                                        filterType: index,
                                                        filterData: dataFilter,
                                                        _setCheckedFilterParams: _this._setCheckedFilterParams
                                                    })
                                                }}>
                                                    <View style={styles.multiPicker}>
                                                        <Text style={styles.filterLabel}><Translation str='body'/></Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (addACarData.hasOwnProperty('stm_s_s_body') && Object.keys(addACarData.stm_s_s_body).length > 0) ?
                                                                    _.map(addACarData['stm_s_s_body'], function (val, slug) {
                                                                        return (
                                                                            <TouchableOpacity
                                                                                activeOpacity={0.8} key={slug}
                                                                                onPress={() => {
                                                                                    _this._deleteFilterParam('body', slug)
                                                                                }}>
                                                                                <View style={styles.filterCheckedItem}>
                                                                                    <Text style={{
                                                                                        marginRight: 10,
                                                                                        fontSize: 12
                                                                                    }}>{val}</Text>
                                                                                    <Ico icoName='lnr-cross'
                                                                                         icoSize={12}
                                                                                         icoColor={GLOBALS.COLOR.title}/>
                                                                                </View>
                                                                            </TouchableOpacity>
                                                                        )
                                                                    })
                                                                    :
                                                                    <View style={styles.filterPlchldrItem}>
                                                                        <Text style={{
                                                                            fontSize: 14,
                                                                            color: '#9f9f9f'
                                                                        }}><Translation str='choose'/> {index}...</Text>
                                                                    </View>
                                                            }
                                                        </View>
                                                        <View style={styles.arrowMulti}>
                                                            <Ico icoName='lnr-chevron-right'
                                                                 icoColor={GLOBALS.COLOR.gray88}
                                                                 icoSize={16}/>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        case 'mileage':
                                            return (
                                                <View key={index} style={styles.multiPicker}>
                                                    <Text style={styles.filterLabel}><Translation str='mileage'/></Text>
                                                    <View style={styles.inputWrap}>
                                                        <TextInput underlineColorAndroid='transparent'
                                                                   style={[styles.input, styles.mileage]}
                                                                   keyboardType='numeric'
                                                                   onChangeText={(text) => {
                                                                       addACarData['stm_s_s_mileage'] = text;
                                                                   }}
                                                                   defaultValue={(addACarData.hasOwnProperty('stm_s_s_mileage')) ? addACarData['stm_s_s_mileage'] : ''}
                                                        />
                                                        <Text style={styles.abs}>(<Translation str='km'/>)</Text>
                                                    </View>
                                                </View>
                                            )
                                        case 'engine':
                                            return (
                                                <View key={index} style={styles.multiPicker}>
                                                    <Text style={styles.filterLabel}><Translation str='engine'/></Text>
                                                    <View style={styles.inputWrap}>
                                                        <TextInput underlineColorAndroid='transparent'
                                                                   style={styles.input}
                                                                   keyboardType='numeric'
                                                                   onChangeText={(text) => {
                                                                       addACarData['stm_s_s_engine'] = text;
                                                                   }}
                                                                   defaultValue={(addACarData.hasOwnProperty('stm_s_s_engine')) ? addACarData['stm_s_s_engine'] : ''}
                                                        />
                                                    </View>
                                                </View>
                                            )
                                        case 'price':
                                            return (
                                                <View key={index} style={styles.multiPicker}>
                                                    <Text style={[styles.filterLabel, (_this.state.priceEmpty && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation str='price'/><Text
                                                        styles={styles.required}>*</Text></Text>
                                                    <View style={styles.inputWrap}>
                                                        <TextInput underlineColorAndroid='transparent'
                                                                   style={[styles.inputPrice, styles.price]}
                                                                   keyboardType='numeric'
                                                                   onChangeText={(text) => {
                                                                       validateFields[index] = (text.length > 0) ? true : false
                                                                       addACarData['stm_car_price'] = text;
                                                                   }}
                                                                   defaultValue={(addACarData.hasOwnProperty('stm_car_price')) ? addACarData['stm_car_price'] : ''}
                                                        />
                                                        <Text style={styles.abs}>({_this.state.currencyName})</Text>
                                                        <Text style={styles.abs_left}>{_this.state.currency}</Text>
                                                    </View>
                                                </View>
                                            );
                                        case 'location':
                                            return (
                                                <View key={index}>
                                                    <View style={styles.locationMainWrap}>
                                                        <Text style={styles.filterLabel}><Translation str='location'/></Text>
                                                        <View style={styles.locationInputWrap}>
                                                            <GooglePlacesAutocomplete
                                                                defaultValue={(addACarData.hasOwnProperty('stm_location_text')) ? addACarData['stm_location_text'] : _this.state.locationName}
                                                                minLength={3}
                                                                fetchDetails={true}
                                                                currentLocation={false}
                                                                multiline={false}
                                                                onPress={(data, details = null) => {
                                                                    let lctn = details.geometry.location;

                                                                    addACarData['stm_location_text'] = details.formatted_address;
                                                                    addACarData['stm_lat'] = lctn.lat;
                                                                    addACarData['stm_lng'] = lctn.lng;
                                                                }}
                                                                query={{
                                                                    key: _this.state.apiKeyAndroid,
                                                                    language: 'en',
                                                                    types: '(cities)' // default: 'geocode'
                                                                }}
                                                                styles={{
                                                                    textInputContainer: {
                                                                        backgroundColor: GLOBALS.COLOR.bg,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        width: '100%',
                                                                        padding: 0,
                                                                        marginRight: 10,
                                                                        marginLeft: 0
                                                                    }
                                                                }}
                                                                listViewDisplayed={false}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        default:
                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    activeOpacity={0.8} onPress={() => {
                                                    _this.props.navigation.navigate('AddACarDefaultChoose', {
                                                        title: index,
                                                        checkedParams: addACarData,
                                                        filterType: index,
                                                        filterData: dataFilter,
                                                        _setCheckedFilterParams: _this._setCheckedFilterParams
                                                    })
                                                }}>
                                                    <View style={styles.multiPicker}>
                                                        <Text numberOfLines={1} ellipsizeMode={'tail'}
                                                              style={styles.filterLabel}>{index.toUpperCase()}</Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (addACarData.hasOwnProperty('stm_s_s_' + index) && Object.keys(addACarData['stm_s_s_' + index]).length > 0) ?
                                                                    _.map(addACarData['stm_s_s_' + index], function (val, slug) {
                                                                        return (
                                                                            <TouchableOpacity
                                                                                activeOpacity={0.8} key={slug}
                                                                                onPress={() => {
                                                                                    _this._deleteFilterParam(index, slug)
                                                                                }}>
                                                                                <View style={styles.filterCheckedItem}>
                                                                                    <Text style={{
                                                                                        marginRight: 10,
                                                                                        fontSize: 12
                                                                                    }}>{val}</Text>
                                                                                    <Ico icoName='lnr-cross'
                                                                                         icoSize={12}
                                                                                         icoColor={GLOBALS.COLOR.title}/>
                                                                                </View>
                                                                            </TouchableOpacity>
                                                                        )
                                                                    })
                                                                    :
                                                                    <View style={styles.filterPlchldrItem}>
                                                                        <Text style={{
                                                                            fontSize: 14,
                                                                            color: '#9f9f9f'
                                                                        }}><Translation str='choose'/> {index}...</Text>
                                                                    </View>
                                                            }
                                                        </View>
                                                        <View style={styles.arrowMulti}>
                                                            <Ico icoName='lnr-chevron-right'
                                                                 icoColor={GLOBALS.COLOR.gray88}
                                                                 icoSize={16}/>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                    }
                                }
                            })
                        }
                        <View style={styles.btnWrap}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.publishButton, {backgroundColor: _this.state.secondColor}]}
                                onPress={() => {
                                    _this._btnOnPress()
                                }}>
                                {
                                    _this.state.load
                                        ?
                                        <ActivityIndicator color={GLOBALS.COLOR.white}/>
                                        :
                                        <Text style={styles.btnText}>
                                            {
                                                _this.state.editMode
                                                    ? <Translation str='update'/>
                                                    : <Translation str='publish'/>
                                            }
                                        </Text>

                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.additionButton, {backgroundColor: _this.state.mainColor}]}
                                onPress={() => {
                                    _this._btnAdditionalOnPress()
                                }}>
                                <Text style={styles.btnText}><Translation str='additional'/></Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
                <Toast ref="toast" positionValue={180}/>
            </KeyboardAvoidingView>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    content: {
        position: 'absolute',
        top: 50,
        left: 50
    },

    required: {
        color: GLOBALS.COLOR.red
    },

    svgStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34rem',
        height: '34rem',
        borderColor: GLOBALS.COLOR.gray88,
        borderRadius: 34,
        borderWidth: 1,
        marginLeft: '10rem',
        marginRight: '10rem'
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
    },

    error: {
        color: GLOBALS.COLOR.red
    },

    filterCheckedItem: {
        width: 'auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        borderRadius: '4rem',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: GLOBALS.COLOR.hr,
        paddingTop: '8rem',
        paddingBottom: '8rem',
        paddingLeft: '12rem',
        paddingRight: '12rem',
        margin: 5
    },

    filterPlchldrItem: {
        width: 'auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '8rem',
        paddingBottom: '8rem',
        paddingLeft: '12rem',
        paddingRight: '12rem',
        margin: 5
    },

    main_center: {
        fontWeight: '600',
        textAlign: 'center',
        color: GLOBALS.COLOR.title
    },

    center: {
        textAlign: 'center',
        color: GLOBALS.COLOR.gray88
    },

    img: {
        width: '100%',
        height: '200rem',
    },

    flatStyle: {
        flex: 1,
        padding: '20rem'
    },

    icoStyle: {
        width: '15rem',
        marginRight: '3rem'
    },

    hide: {
        height: 0
    },

    addMediaWrap: {
        paddingTop: '5rem',
        paddingBottom: '5rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    mediaBtnsWrap: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '10rem'
    },

    photoBtn: {
        width: '48%',
        minHeight: '100rem',
        backgroundColor: GLOBALS.COLOR.bg,
    },

    videoBtn: {
        width: '48%',
        minHeight: '100rem',
        backgroundColor: GLOBALS.COLOR.bg,
    },

    mediaBtn: {
        width: '100%',
        height: '100rem',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center'
    },

    inputWrap: {
        width: '70%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative'
    },

    abs: {
        position: 'absolute',
        right: '10rem'
    },

    abs_left: {
        position: 'absolute',
        left: '10rem'
    },

    input: {
        width: '100%',
        height: '40rem',
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '5rem',
        paddingLeft: '10rem',
        paddingRight: '10rem'
    },

    mileage: {
        paddingRight: '40rem'
    },

    price: {
        paddingRight: '50rem'
    },

    inputPrice: {
        width: '100%',
        height: '40rem',
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '5rem',
        paddingLeft: '20rem',
        paddingRight: '10rem'
    },

    multiPicker: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '10rem',
        paddingBottom: '10rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        borderBottomColor: GLOBALS.COLOR.hr
    },

    arrowMulti: {
        width: 'auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '25rem',
        borderColor: GLOBALS.COLOR.hr,
        borderWidth: 1,
        borderStyle: 'solid',
        paddingTop: '7rem',
        paddingBottom: '7rem',
        paddingRight: '7rem',
        paddingLeft: '9rem',
    },

    checkedItems: {
        width: '58%',
        minHeight: '40rem',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },

    selectsWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '10rem',
        paddingBottom: '10rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        borderBottomColor: GLOBALS.COLOR.hr
    },

    filterLabel: {
        width: '30%',
        fontSize: '14rem',
        fontWeight: '600',
        color: GLOBALS.COLOR.title,
    },

    filterMediaLabel: {
        width: '100%',
        fontSize: '14rem',
        fontWeight: '600',
        color: GLOBALS.COLOR.title,
        marginBottom: '10rem'
    },

    selectWrap: {
        width: '32%',
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '8rem'
    },

    locationMainWrap: {
        minHeight: '50rem',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        paddingTop: '10rem',
        paddingBottom: '10rem',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        borderBottomColor: GLOBALS.COLOR.hr
    },

    sliderWrap: {
        width: '50%'
    },

    locationInputWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        width: '70%',
        marginLeft: '10rem',
        alignItems: 'flex-end',
    },

    publishButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '48%',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '10rem'
    },

    additionButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '48%',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '10rem'
    },

    btnText: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '700',
    },

    btnWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20rem',
        paddingBottom: '20rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
});