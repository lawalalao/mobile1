import React from 'react';
import {
    ScrollView,
    View,
    Dimensions,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Image
} from 'react-native';

import {EventRegister} from 'react-native-event-listeners';
import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import Ico from '../components/Ico';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import {addACarParamms, getLocationName, getLatLong, getEditCar} from "../helpers/MotorsRestApi";
import Toast, {DURATION} from 'react-native-easy-toast'
import _ from 'lodash';
import {Capitalize} from "../helpers/Utils";

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let addACarData = {};
let validateFields = {};

export default class AddACarStepOne extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            userId: 0,
            userToken: '',
            isLoading: true,
            refreshing: false,
            stepOne: {},
            stepTwo: {},
            stepThree: {},
            locationRadius: '5 mi',
            locationName: '',
            featured: {},
            apiKeyAndroid: '',
            apiKeyIos: '',
            additional_key: 'stm_additional_features',
            listingId: 0,
            editMode: false,
            resetAll: false,
            updateAfterMedia: false,
            mainColor: '',
            secondColor: '',
            checkValidate: false,
            currency: '',
            currencyName: '',
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
                    <Text style={styles.center}><Translation str='step_1'/></Text>
                </View>
            ),
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        (!_this.props.navigation.state.params.editMode) ? navigation.replace('Home') : navigation.goBack();
                    }}>
                        <Ico icoName='lnr-cross' icoColor={GLOBALS.COLOR.gray88} icoSize={14}/>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: (
                <TouchableOpacity
                    activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                    _this._btnOnPress()
                }}>
                    <View>
                        <Ico icoName='arrow-right1' icoColor={GLOBALS.COLOR.gray88} icoSize={14}/>
                    </View>
                </TouchableOpacity>),
        }
    };

    findCoordinates = async () => {

        if (_this.state.stepOne.hasOwnProperty('location')) {
            try {
                let apiKeyAndr = await AsyncStorage.getItem('apiKeyAndroid');
                let apiKeyIos = await AsyncStorage.getItem('apiKeyIos');
                this.setState({apiKeyAndroid: apiKeyAndr, apiKeyIos: apiKeyIos});
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
                        console.log(error.message);
                    },
                    {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
                );
            } catch (e) {
                console.log("error from AsyncStorage Add A Car One: ", e);
            }
        }
    };

    _validateFieldsMaping = (valid = false) => {
        _.map(_this.state.stepOne, function (dataFilter, index) {
            validateFields[index] = valid;
        });
    }

    async componentWillMount() {

        if(_this.props.navigation.state.params.resetAll) {
            addACarData = {};
        }

        _this.listener = EventRegister.addEventListener('resetAddACar', (data) => {
            addACarData = {};
            _this.setState({
                resetAll: true
            })
        })

        let mc = '';
        let sc = '';
        try {
            mc = await AsyncStorage.getItem('main_color');
            sc = await AsyncStorage.getItem('secondary_color');

            let user = await AsyncStorage.getItem('userData');
            user = JSON.parse(user);
            this.setState({userId: user.ID, userToken: user.token});

            addACarData['user_id'] = user.ID;
            addACarData['user_token'] = user.token;
        } catch (e) {
            console.log("error from AsyncStorage Add A Car One 2: ", e);
        }

        let currency = '';
        let currencyName = '';
        try {
            currency = await AsyncStorage.getItem('currency');
            currencyName = await AsyncStorage.getItem('currency_name');
        } catch (e) {
            console.log("error from AsyncStorage Add A Car Two: ", e);
        }

        _this.setState({
            mainColor: mc,
            secondColor: sc,
            currency: currency,
            currencyName: currencyName,
        })

        addACarParamms().then((responceJSON) => {
            _this.setState({
                isLoading: false,
                refreshing: false,
                stepOne: responceJSON.step_one,
                stepTwo: responceJSON.step_two,
                stepThree: responceJSON.step_three,
            }, function () {

            })

            if(!_this.state.editMode) _this._validateFieldsMaping();
            _this.findCoordinates();
        });



        if (_this.props.navigation.state.params.editMode) {
            await getEditCar(_this.props.navigation.state.params.listingId).then((responceJSON) => {
                addACarData['stm_current_car_id'] = _this.props.navigation.state.params.listingId;
                addACarData['stm_car_price'] = responceJSON.price;
                addACarData['stm_additional_features'] = responceJSON.features;
                addACarData['stm_seller_notes'] = responceJSON.content;
                addACarData['stm_location_text'] = responceJSON.car_location;
                addACarData['stm_lat'] = responceJSON.car_lat;
                addACarData['stm_lng'] = responceJSON.car_lng;
                addACarData['images'] = responceJSON.gallery;

                _.map(responceJSON.info.step_one, function (data, index) {
                    addACarData['stm_f_s_' + index] = data;
                })

                _.map(responceJSON.info.step_two, function (data, index) {
                    addACarData['stm_s_s_' + index] = data;
                })

                _this.setState({
                    editMode: true
                })

                _this._validateFieldsMaping(true);
            })
        }
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(_this.listener);
    }

    _setFilterSelectParams = (key, value) => {
        let k = (key != 'images') ? 'stm_f_s_' + key : key;
        addACarData[k] = value;

        validateFields["add_media"] = (Object.keys(value).length > 0) ? true : false;

        _this.setState({
            updateAfterMedia: true
        })
    }

    _btnOnPress = () => {

        let validateText = '';
        let i = 0;
        _.map(validateFields, function (val, index) {
            if (!val) {
                validateText += (i == 0) ? '' : ', ';
                validateText += Capitalize(index.replace('_', ' '));
                i++;
            }
        });

        if (validateText.length != '') {
            _this._showToast('Please enter ' + validateText);
            _this.setState({
                checkValidate: true
            });
        } else {
            _this.setState({
                checkValidate: false
            });
            _this.props.navigation.navigate('AddACarStepTwo', {
                'add_car_data': addACarData,
                'step_two': _this.state.stepTwo,
                'step_three': _this.state.stepThree,
                'edit_mode': _this.state.editMode,
            });
        }
    }

    _setCheckedFilterParams = (key, values) => {
        validateFields[key] = true;
        addACarData['stm_f_s_' + key] = values;
        _this.setState({
            refreshing: false
        })
    }

    _deleteFilterParam = (type, key) => {
        validateFields[type] = false;
        delete addACarData['stm_f_s_' + type][key];
        _this.setState({
            refreshing: false
        })
    }

    _validateTextFields = (index, txt) => {
        validateFields[index] = (txt.length > 0) ? true : false;
    }

    componentDidUpdate() {}

    _showToast = (text, color) => {
        _this.refs['toast'].show(text, 5000);
    }

    render() {
        if (_this.state.isLoading) {
            return (
                <View style={{flex: 1, alignItems: 'center', paddingTop: 100}}>
                    <ActivityIndicator/>
                </View>
            )
        }

        return (
            <KeyboardAvoidingView behavior={"padding"} style={{flex: 1, width: '100%'}}>
                <ScrollView>
                    <View>
                        {
                            _.map(_this.state.stepOne, function (dataFilter, index) {
                                if (index.length > 0) {
                                    switch (index) {
                                        case 'seller_notes':
                                            return (
                                                <View key={index} style={styles.addMediaWrap}>
                                                    <Text
                                                        style={[styles.filterMediaLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                        str='seller_note'/><Text
                                                        styles={styles.required}>*</Text></Text>
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
                                                        data={_this.state.stepOne.stm_additional_features}
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
                                                    <Text
                                                        style={[styles.filterMediaLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                        str='add_media'/><Text
                                                        styles={styles.required}>*</Text></Text>

                                                    {
                                                        addACarData.hasOwnProperty('images') && addACarData.images.hasOwnProperty(0)
                                                            ?
                                                            <View style={styles.mediaImgWrap}>
                                                                <TouchableOpacity
                                                                    activeOpacity={0.8} style={styles.mediaBtn}
                                                                    onPress={() => {
                                                                        _this.props.navigation.navigate('AddACarChooseImageDragabble', {
                                                                            'addACarParams': addACarData,
                                                                            _setFilterSelectParams: _this._setFilterSelectParams
                                                                        })
                                                                    }}>
                                                                    <Image
                                                                        source={{uri: (addACarData.images.hasOwnProperty(0)) ? `data:image/jpg;base64,${addACarData.images[0]['src']}` : addACarData.images[0]['src']}}
                                                                        style={styles.img}/>
                                                                    <View style={styles.addBtnAbs}>
                                                                        <Ico icoName='add_media' icoSize={40}
                                                                             icoColor={GLOBALS.COLOR.white}/>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </View>
                                                            :
                                                            <View style={styles.mediaBtnsWrap}>
                                                                <View style={styles.photoBtn}>
                                                                    <TouchableOpacity
                                                                        activeOpacity={0.8} style={styles.mediaBtn}
                                                                        onPress={() => {
                                                                            _this.props.navigation.navigate('AddACarChooseImageDragabble', {
                                                                                'addACarParams': addACarData,
                                                                                _setFilterSelectParams: _this._setFilterSelectParams
                                                                            })
                                                                        }}>
                                                                        <Ico icoName='add_media' icoSize={40}
                                                                             icoColor={GLOBALS.COLOR.grayAC}/>
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <View style={styles.videoBtn}></View>
                                                            </View>
                                                    }
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
                                                        <Text
                                                            style={[styles.filterLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                            str='make'/><Text
                                                            styles={styles.required}>*</Text></Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (addACarData.hasOwnProperty('stm_f_s_make') && Object.keys(addACarData.stm_f_s_make).length > 0)
                                                                    ?
                                                                    _.map(addACarData['stm_f_s_make'], function (val, slug) {
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
                                                                 icoSize={14}/>
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
                                                        <Text
                                                            style={[styles.filterLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                            str='body'/><Text
                                                            styles={styles.required}>*</Text></Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (addACarData.hasOwnProperty('stm_f_s_body') && Object.keys(addACarData.stm_f_s_body).length > 0) ?
                                                                    _.map(addACarData['stm_f_s_body'], function (val, slug) {
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
                                                                 icoSize={14}/>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        case 'mileage':
                                            return (
                                                <View key={index} style={styles.multiPicker}>
                                                    <Text
                                                        style={[styles.filterLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                        str='mileage'/><Text
                                                        styles={styles.required}>*</Text></Text>
                                                    <View style={styles.inputWrap}>
                                                        <TextInput underlineColorAndroid='transparent'
                                                                   style={[styles.input, styles.mileage]}
                                                                   keyboardType='numeric'
                                                                   onChangeText={(text) => {
                                                                       _this._validateTextFields(index, text);
                                                                       addACarData['stm_f_s_mileage'] = text;
                                                                   }}
                                                                   defaultValue={(addACarData.hasOwnProperty('stm_f_s_mileage')) ? addACarData['stm_f_s_mileage'] : ''}
                                                        />
                                                        <Text style={styles.abs}>(<Translation str='km'/>)</Text>
                                                    </View>
                                                </View>
                                            )
                                        case 'engine':
                                            return (
                                                <View key={index} style={styles.multiPicker}>
                                                    <Text
                                                        style={[styles.filterLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                        str='engine'/><Text
                                                        styles={styles.required}>*</Text></Text>
                                                    <View style={styles.inputWrap}>
                                                        <TextInput underlineColorAndroid='transparent'
                                                                   style={styles.input}
                                                                   keyboardType='numeric'
                                                                   defaultValue={(addACarData.hasOwnProperty('stm_f_s_engine')) ? addACarData['stm_f_s_engine'] : ''}
                                                                   onChangeText={(text) => {
                                                                       _this._validateTextFields(index, text);
                                                                       addACarData['stm_f_s_engine'] = text;
                                                                   }}
                                                        />
                                                    </View>
                                                </View>
                                            )
                                        case 'price':
                                            return (
                                                <View key={index} style={styles.multiPicker}>
                                                    <Text
                                                        style={[styles.filterLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                        str='price'/><Text
                                                        styles={styles.required}>*</Text></Text>
                                                    <View style={styles.inputWrap}>
                                                        <TextInput underlineColorAndroid='transparent'
                                                                   style={[styles.input, styles.price]}
                                                                   keyboardtype='numeric'
                                                                   defaultValue={(addACarData.hasOwnProperty('stm_car_price')) ? addACarData['stm_car_price'] : ''}
                                                                   onChangeText={(text) => {
                                                                       _this._validateTextFields(index, text);
                                                                       addACarData['stm_car_price'] = text;
                                                                   }}
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
                                                        <Text
                                                            style={[styles.filterLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}><Translation
                                                            str='location'/><Text
                                                            styles={styles.required}>*</Text></Text>
                                                        <View style={styles.locationInputWrap}>
                                                            <GooglePlacesAutocomplete
                                                                defaultValue={(addACarData.hasOwnProperty('stm_location_text')) ? addACarData['stm_location_text'] : _this.state.locationName}
                                                                minLength={3}
                                                                fetchDetails={true}
                                                                currentLocation={false}
                                                                onPress={(data, details = null) => {
                                                                    let lctn = details.geometry.location;
                                                                    _this._validateTextFields(index, details.formatted_address);
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
                                                                        width: 'auto',
                                                                        padding: 0,
                                                                        marginRight: 10
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
                                                              style={[styles.filterLabel, (_this.state.checkValidate && validateFields.hasOwnProperty(index) && !validateFields[index]) ? styles.error : '']}>{index.toUpperCase()}<Text
                                                            styles={styles.required}>*</Text></Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (addACarData.hasOwnProperty('stm_f_s_' + index) && Object.keys(addACarData['stm_f_s_' + index]).length > 0) ?
                                                                    _.map(addACarData['stm_f_s_' + index], function (val, slug) {
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
                                                                 icoSize={14}/>
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
                                style={[styles.searchButton, {backgroundColor: _this.state.secondColor}]}
                                onPress={() => {
                                    _this._btnOnPress()
                                }}>
                                <Text style={styles.btnText}><Translation str='next_step'/></Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
                <Toast ref="toast" positionValue={180} style={{marginLeft: 20, marginRight: 20}}/>
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

    required: {
        color: GLOBALS.COLOR.red
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
        height: '100rem',
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

    addBtnAbs: {
        width: '100%',
        height: '100rem',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0
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

    searchButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '8rem'
    },

    btnText: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '700',
    },

    btnWrap: {
        paddingTop: '20rem',
        paddingBottom: '20rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
});