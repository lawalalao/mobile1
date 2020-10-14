import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Dimensions
} from 'react-native'

import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import _ from 'lodash';
import AsyncStorage from "@react-native-community/async-storage";
import Translation from '../helpers/Translation';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let checked = {};

export default class FilterDefaultChoose extends React.Component {
    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            title: 'Choose',
            checkedParams: {},
            filterType: '',
            filterData: {},
            filterDataFull: {},
            update: false,
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
                    <Text style={styles.center}><Translation str='choose'/> {navigation.state.params.title}</Text>
                </View>
            ),
            headerLeft: (<View>
                <TouchableOpacity
                    activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                    _this.props.navigation.goBack();
                }}>
                    <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                </TouchableOpacity>
            </View>),
            headerRight: (<View style={styles.invisibleBlock}></View>)
        }
    };

    _updateFilterParams = (make, models) => {
        let newModels = (Object.keys(make).length > 0) ? [] : models;
        _.map(make, function (val, index) {
            _.forEach(models, function (value, key) {
                if (value.parent == index) {
                    newModels.push(value);
                }
            })
        });

        _this.setState({
            filterData: newModels,
        })
    }


    async componentWillMount() {
        try {
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');

            _this.setState({
                mainColor: mc,
                secondColor: sc
            })
        } catch (e) {
            console.log("error from AsyncStorage Colors: ", e);
        }
        
        if(_this.props.navigation.state.params.filterType == 'serie' && typeof(_this.props.navigation.state.params.checkedParams.make) != 'undefined') {
            _this._updateFilterParams(_this.props.navigation.state.params.checkedParams.make, _this.props.navigation.state.params.filterData)

            _this.setState({
                filterType: _this.props.navigation.state.params.filterType,
            });
        } else {
            _this.setState({
                checkedParams: _this.props.navigation.state.params.checkedParams,
                filterType: _this.props.navigation.state.params.filterType,
                filterData: _this.props.navigation.state.params.filterData,
                filterDataFull: _this.props.navigation.state.params.filterData
            });
        }
    }

    render() {
        return(
            <View style={styles.container}>
                <View style={styles.inputWrap}>
                    <TextInput underlineColorAndroid='transparent'
                               multiline={true}
                               style={styles.input}
                               autoCapitalize='none'
                               onChangeText={(text) => {
                                   if(text.length > 1) {
                                       let objectMakes = [];
                                       _.map(_this.state.filterData, function (data, index) {
                                           let s = data.slug;

                                           if (s.includes(text)) {
                                               objectMakes[Object.keys(objectMakes).length] =  data;
                                           }

                                       })

                                       _this.setState({
                                           filterData: objectMakes
                                       })
                                   } else {
                                       _this.setState({
                                           filterData: _this.state.filterDataFull
                                       })
                                   }
                               }}
                    />
                </View>
                <FlatList
                    style={styles.flatStyle}
                    data={_this.state.filterData}
                    extraData={this.state}
                    renderItem={({item}) =>
                        <TouchableOpacity
                            activeOpacity={0.8} onPress={() => {
                            _this.setState({
                                update: true
                            })

                            if(!checked.hasOwnProperty(_this.state.filterType)) {
                                checked[_this.state.filterType] = {};
                                checked[_this.state.filterType][item.slug] = item.label;
                            } else {
                                if(!checked[_this.state.filterType].hasOwnProperty(item.slug)) {
                                    checked[_this.state.filterType][item.slug] = item.label;
                                } else {
                                    delete checked[_this.state.filterType][item.slug];
                                }
                            }
                        }}>
                            {
                                (!checked.hasOwnProperty(_this.state.filterType)) ?
                                    <View style={styles.listItem}>
                                        <Text style={[styles.title, {color: _this.state.secondColor}]}>{item.label}</Text>
                                        <Text style={styles.count}>{item.count}</Text>
                                    </View>
                                    :
                                    ( !checked[_this.state.filterType].hasOwnProperty(item.slug)) ?
                                        <View style={styles.listItem}>
                                            <Text style={[styles.title, {color: _this.state.secondColor}]}>{item.label}</Text>
                                            <Text style={styles.count}>{item.count}</Text>
                                        </View>
                                        :
                                        <View style={[styles.listItemBorder, {borderColor: _this.state.mainColor}]}>
                                            <Text style={[styles.title, {color: _this.state.secondColor}]}>{item.label}</Text>
                                            <View class={[styles.checkWrap, {borderColor: _this.state.mainColor}]}>
                                                <Ico icoName='lnr-check' icoSize={16} icoColor={_this.state.mainColor} />
                                            </View>
                                        </View>
                            }
                        </TouchableOpacity>
                    }
                    keyExtractor={({item}, index) => index.toString()}
                />
                <View style={styles.btnWrap}>
                    <TouchableOpacity
                        activeOpacity={0.8} style={[styles.searchButton, {backgroundColor: _this.state.secondColor}]} onPress={() => {
                        _this.props.navigation.goBack();
                        if(checked.hasOwnProperty(_this.state.filterType)) _this.props.navigation.state.params._setCheckedFilterParams(_this.state.filterType, checked[_this.state.filterType]);
                    }}>
                        <Ico icoName='magnifier' icoSize={16} icoColor={GLOBALS.COLOR.white}/>
                        <Text style={styles.btnText}><Translation str='choose_model'/></Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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

    center: {
        textAlign: 'center'
    },

    invisibleBlock: {
        width: '30rem'
    },

    flatStyle: {
        flex: 1,
        width: '100%',
        height: '100%',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    listItem: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'auto',
        height: '45rem',
        borderWidth: '2rem',
        borderColor: GLOBALS.COLOR.bg,
        borderRadius: '10rem',
        marginTop: '20rem',
        paddingLeft: '15rem',
        paddingRight: '15rem'
    },

    listItemBorder: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'auto',
        height: '45rem',
        borderWidth: '2rem',
        borderRadius: '10rem',
        marginTop: '20rem',
        paddingLeft: '15rem',
        paddingRight: '15rem'
    },

    title: {
        width: '90%',
        fontSize: '15rem',
        fontWeight: '500',
    },

    count: {
        width: '10%',
        color: GLOBALS.COLOR.grayAC,
        fontSize: '14rem',
        textAlign: 'center'
    },

    checkWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        borderRadius: '20rem',
        borderWidth: '2rem',
    },

    inputWrap: {
        paddingTop: '10rem',
        paddingLeft: '20rem',
        paddingRight: '20rem'
    },

    input: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        textAlignVertical: 'top',
        width: '100%',
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '5rem',
        paddingTop: '11rem',
        paddingLeft: '10rem',
        paddingRight: '10rem',
        paddingBottom: '10rem',
    },

    btnWrap: {
        paddingTop: '5rem',
        paddingBottom: '10rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },

    searchButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '10rem'
    },

    btnText: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '500',
        marginLeft: '10rem'
    },
});