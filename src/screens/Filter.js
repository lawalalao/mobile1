import React from 'react';
import {
    ScrollView,
    RefreshControl,
    View,
    Dimensions,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Slider,
    Image
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import Ico from '../components/Ico';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import {getFeatured, getFilter, getLocationName, getLatLong} from "../helpers/MotorsRestApi";
import AppBottomNavigation from '../components/AppBottomNavigation'
import _ from 'lodash';

import FilterSelect from '../components/FilterSelect';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let parammsForFilter = {};

export default class Filter extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            isLoading: true,
            refreshing: false,
            filterData: {},
            locationRadius: '5 mi',
            locationName: '',
            featured: {},
            apiKeyAndroid: '',
            apiKeyIos: '',
            mainColor: '',
            secondColor: ''
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
                    <Text style={styles.center}><Translation str='filter'/></Text>
                </View>
            ),
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        navigation.replace('Home');
                    }}>
                        <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: (<View style={styles.invisibleBlock}></View>),
        }
    };

    findCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                let coord = position.coords;

                if (coord.latitude != 0 && coord.longitude != 0) {
                    parammsForFilter['stm_lat'] = coord.latitude;
                    parammsForFilter['stm_lng'] = coord.longitude;

                    getLocationName(coord.latitude, coord.longitude, _this.state.apiKeyAndroid).then((responseJson) => {
                        if (responseJson.hasOwnProperty('results') && responseJson.results.length > 0) {
                            _this.setState({locationName: responseJson.results[0].formatted_address});
                        }
                    }, function () {
                    })
                }
            },
            error => {
                console.log(error.code);
                console.log(error.message);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );
    };

    async componentWillMount() {

        parammsForFilter['max_search_radius'] = 5;

        try {
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');

            _this.setState({
                mainColor: mc,
                secondColor: sc
            })

            let apiKeyAndr = await AsyncStorage.getItem('apiKeyAndroid');
            let apiKeyIos = await AsyncStorage.getItem('apiKeyIos');
            this.setState({apiKeyAndroid: apiKeyAndr, apiKeyIos: apiKeyIos});
        } catch (e) {
            console.log("error from AsyncStorage Filter: ", e);
        }

        getFilter().then((responceJSON) => {

            if(typeof(responceJSON.search_radius) != 'undefined') {
                _this.findCoordinates();
            }

            _this.setState({
                isLoading: false,
                refreshing: false,
                filterData: responceJSON,
            }, function () {

            })
        });

        getFeatured().then((responseJson) => {
            _this.setState({
                featured: responseJson.featured
            })
        });
    }

    _setFilterSelectParams = (key, value) => {
        parammsForFilter[key] = value;
    }

    _btnOnPress = () => {
        _this.props.navigation.navigate('Inventory', {'filter_data': parammsForFilter});
    }

    _onRefresh = () => {
        this.setState({refreshing: true});
        getFilter().then((responceJSON) => {

            if(typeof(responceJSON.search_radius) != 'undefined') {
                _this.findCoordinates();
            }

            _this.setState({
                isLoading: false,
                refreshing: false,
                filterData: responceJSON,
            }, function () {
            })
        });

        getFeatured().then((responseJson) => {
            _this.setState({
                featured: responseJson.featured
            })
        });
    };

    _setCheckedFilterParams = (key, values) => {
        parammsForFilter[key] = values;
        _this.setState({
            refreshing: false
        })
    }

    _deleteFilterParam = (type, key) => {
        delete parammsForFilter[type][key];
        _this.setState({
            refreshing: false
        })
    }

    componentDidUpdate() {}

    render() {
        if (_this.state.isLoading) {
            return (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={_this.state.refreshing}
                            onRefresh={_this._onRefresh}
                        />
                    }
                >
                    <View style={{flex: 1, alignItems: 'center', paddingTop: 100}}><ActivityIndicator/></View>
                </ScrollView>
            )
        }

        let price = (typeof(_this.state.filterData.price) != 'undefined') ? _this.state.filterData.price : null;
        let year = (typeof(_this.state.filterData.year) != 'undefined') ? _this.state.filterData.year : null;
        //let locationFilter = (typeof(_this.state.filterData.search_radius) != 'undefined') ? true : null;

        const placeholderFrom = {
            label: 'From',
            value: '',
        };

        const placeholderTo = {
            label: 'To',
            value: '',
        };

        const placeholderMin = {
            label: 'Min',
            value: '',
        };

        const placeholderMax = {
            label: 'Max',
            value: '',
        };

        let fromPlchldr = [placeholderFrom];
        let toPlchldr = [placeholderTo];

        if(year != null) {
            fromPlchldr.push(...year);
            toPlchldr.push(...year);
        }

        let minPlchldr = [placeholderMin];
        let maxPlchldr = [placeholderMax];

        if(price != null) {
            minPlchldr.push(...price);
            maxPlchldr.push(...price);
        }

        return (
            <View style={styles.container}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={_this.state.refreshing}
                            onRefresh={_this._onRefresh}
                        />
                    }
                >
                    <View>
                        {
                            _.map(_this.state.filterData, function (dataFilter, index) {
                                if(index.length > 0) {
                                    switch (index) {
                                        case 'make':
                                            return (
                                                <TouchableOpacity
                                                    activeOpacity={0.8} onPress={() => {
                                                    _this.props.navigation.navigate('FilterMakeChoose', {
                                                        makesData: _this.state.filterData.make,
                                                        _setCheckedFilterParams: _this._setCheckedFilterParams
                                                    })
                                                }}>
                                                    <View key={index} style={styles.multiPicker}>
                                                        <Text style={styles.filterLabel}><Translation str='make'/></Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (typeof(parammsForFilter['make']) != undefined) ?
                                                                    _.map(parammsForFilter['make'], function (val, slug) {
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
                                                                    : ''
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
                                        case 'price':
                                            return (
                                                <View key={index} style={styles.selectsWrap}>
                                                    <Text style={styles.filterLabel}><Translation str='price'/></Text>
                                                    <View style={styles.selectWrap}>
                                                        <FilterSelect filterSelectOpt={minPlchldr}
                                                                      filterType='min_price'
                                                                      filterPlaceholder={placeholderFrom}
                                                                      _setFilterSelectParams={_this._setFilterSelectParams}/>
                                                    </View>
                                                    <View style={styles.selectWrap}>
                                                        <FilterSelect filterSelectOpt={maxPlchldr}
                                                                      filterType='max_price'
                                                                      filterPlaceholder={placeholderTo}
                                                                      _setFilterSelectParams={_this._setFilterSelectParams}/>
                                                    </View>
                                                </View>
                                            );
                                        case 'year':
                                            return (
                                                <View key={index} style={styles.selectsWrap}>
                                                    <Text style={styles.filterLabel}><Translation str='year'/></Text>
                                                    <View style={styles.selectWrap}>
                                                        <FilterSelect filterSelectOpt={fromPlchldr}
                                                                      filterType='min_ca-year'
                                                                      filterPlaceholder={placeholderMin}
                                                                      _setFilterSelectParams={_this._setFilterSelectParams}/>
                                                    </View>
                                                    <View style={styles.selectWrap}>
                                                        <FilterSelect filterSelectOpt={toPlchldr}
                                                                      filterType='max_ca-year'
                                                                      filterPlaceholder={placeholderMax}
                                                                      _setFilterSelectParams={_this._setFilterSelectParams}/>
                                                    </View>
                                                </View>
                                            );
                                        case 'search_radius':
                                            return (
                                                <View key={index}>
                                                    <View style={styles.locationMainWrap}>
                                                        <Text style={styles.filterLabel}><Translation str='location'/></Text>
                                                        <View style={styles.locationInputWrap}>
                                                            <GooglePlacesAutocomplete
                                                                placeholder={_this.state.locationName}
                                                                minLength={3}
                                                                fetchDetails={true}
                                                                currentLocation={false}
                                                                onPress={(data, details = null) => {
                                                                    let lctn = details.geometry.location;

                                                                    parammsForFilter['stm_lat'] = lctn.lat;
                                                                    parammsForFilter['stm_lng'] = lctn.lng;
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
                                                    <View style={styles.locationMainWrap}>
                                                        <Text style={styles.filterLabel} numberOfLines={1}><Translation str='search_radius'/></Text>
                                                        <View style={styles.sliderWrap}>
                                                            <Slider
                                                                onValueChange={value => {
                                                                    _this.setState({
                                                                        locationRadius: value + ' mi'
                                                                    });

                                                                    parammsForFilter['max_search_radius'] = value;
                                                                }}
                                                                minimumValue={5}
                                                                maximumValue={1000}
                                                                step={10}
                                                            ></Slider>
                                                        </View>
                                                        <View style={styles.locationRadiusWrap}>
                                                            <Text
                                                                style={[styles.locationRadius, {color: _this.state.secondColor}]}>{_this.state.locationRadius}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        default:
                                            return (
                                                <TouchableOpacity
                                                    activeOpacity={0.8} onPress={() => {
                                                    _this.props.navigation.navigate('FilterDefaultChoose', {
                                                        title: index,
                                                        checkedParams: parammsForFilter,
                                                        filterType: index,
                                                        filterData: dataFilter,
                                                        _setCheckedFilterParams: _this._setCheckedFilterParams
                                                    })
                                                }}>
                                                    <View key={index} style={styles.multiPicker}>
                                                        <Text style={styles.filterLabel}>{index.toUpperCase()}</Text>
                                                        <View style={styles.checkedItems}>
                                                            {
                                                                (typeof(parammsForFilter[index]) != undefined) ?
                                                                    _.map(parammsForFilter[index], function (val, slug) {
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
                                                                    : ''
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
                                style={[styles.searchButton, {backgroundColor: _this.state.mainColor}]} onPress={() => {
                                _this._btnOnPress()
                            }}>
                                <Ico icoName='magnifier' icoSize={16} icoColor={GLOBALS.COLOR.white}/>
                                <Text style={styles.btnText}><Translation str='vehicles'/></Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={styles.similarWrap}>
                        <Text style={styles.similarMainTitle}><Translation str='recomended'/></Text>
                        <ScrollView horizontal={true}>
                            {

                                _.map(this.state.featured, function (data) {
                                    return (
                                        <View key={data.ID} style={styles.similarItemWrap}>
                                            <TouchableOpacity
                                                activeOpacity={0.8} onPress={() => {
                                                _this.props.navigation.navigate('Details', {listingId: data.ID});
                                            }}>
                                                <View style={styles.similarImgWrap}>
                                                    <Image style={styles.similarImg} source={{uri: data.img}}/>
                                                    <View
                                                        style={[styles.similarPriceWrap, {backgroundColor: _this.state.mainColor}]}>
                                                        <Text style={styles.similarPrice}>{data.price}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.similarTitleWrap}>
                                                    <Text style={styles.similarTitle}
                                                          numberOfLines={2}>{data.title}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            }
                        </ScrollView>
                    </View>
                </ScrollView>
                <AppBottomNavigation navigation={this.props.navigation} activeTab='lnr-magnifier'/>
            </View>
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
        marginRight: '10rem',
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
    },

    invisibleBlock: {
        width: '30rem'
    },

    filterCheckedItem: {
        width: 'auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        borderRadius: '4rem',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '8rem',
        paddingBottom: '8rem',
        paddingLeft: '12rem',
        paddingRight: '12rem',
        margin: 5,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: GLOBALS.COLOR.hr
    },

    center: {
        textAlign: 'center'
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

    multiPicker: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '5rem',
        paddingBottom: '5rem',
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
        backgroundColor: GLOBALS.COLOR.hr,
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
        paddingTop: '5rem',
        paddingBottom: '5rem',
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
        paddingTop: '5rem',
        paddingBottom: '5rem',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        borderBottomColor: GLOBALS.COLOR.hr
    },

    sliderWrap: {
        width: '50%'
    },

    locationTitleWrap: {
        width: '30%',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },

    locationInputWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        width: '70%',
        marginLeft: '10rem',
        alignItems: 'flex-end',
    },

    locationInput: {
        width: '100%',
        height: '40rem',
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '8rem',
        borderWidth: 0
    },

    nearLabel: {
        fontSize: '10rem',
        color: GLOBALS.COLOR.gray88,
    },

    location: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.title
    },

    locationRadiusWrap: {
        width: '20%'
    },

    locationRadius: {
        fontSize: '15rem',
        textAlign: 'center'
    },

    searchButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '30rem'
    },

    btnText: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '700',
        marginLeft: '10rem'
    },

    btnWrap: {
        paddingTop: '20rem',
        paddingBottom: '20rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    similarWrap: {
        paddingTop: '20rem',
        paddingBottom: '20rem',
        paddingLeft: '10rem',
        backgroundColor: GLOBALS.COLOR.title
    },

    similarMainTitle: {
        marginTop: '10rem',
        marginBottom: '30rem',
        marginLeft: '10rem',
        marginRight: '20rem',
        color: GLOBALS.COLOR.white,
        fontSize: '14rem',
        fontWeight: '600'
    },

    similarItemWrap: {
        width: '150rem',
        marginLeft: '10rem',
        marginRight: '10rem',
    },

    similarImgWrap: {
        position: 'relative'
    },

    similarImg: {
        height: '100rem',
    },

    similarPriceWrap: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    similarPrice: {
        fontSize: '14rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '700'
    },

    similarTitleWrap: {
        flex: 1,
        backgroundColor: GLOBALS.COLOR.dark,
        padding: '12rem'
    },

    similarTitle: {
        fontSize: '12rem',
        fontWeight: '500',
        color: GLOBALS.COLOR.white
    },
});