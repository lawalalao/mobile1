import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image, Dimensions
} from 'react-native';

import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import AsyncStorage from "@react-native-community/async-storage";
import Translation from '../helpers/Translation';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;

let checked = {};

export default class AddACarMakeChoose extends React.Component {
    constructor(props) {
        super(props);
        _this = this;

        _this.state = {
            title: 'Choose',
            checkedParams: {},
            filterType: '',
            filterData: {},
            update: false,
            oldChecked: '',
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
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        navigation.goBack()
                    }}>
                        <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                    </TouchableOpacity>
                </View>
            ),
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
            filterData: newModels
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
                filterData: _this.props.navigation.state.params.filterData
            });
        }
    }

    componentDidMount() {
        checked = {};
    }

    render() {
        return(
            <View style={styles.container}>
                <FlatList
                    style={styles.flatStyle}
                    data={_this.state.filterData}
                    extraData={this.state}
                    renderItem={({item}) =>
                        <TouchableOpacity
                            activeOpacity={0.8} style={(item.slug != _this.state.oldChecked) ? styles.gridItem : [styles.gridBorderItem, {borderColor: _this.state.mainColor}]} onPress={() => {
                            if(!checked.hasOwnProperty(_this.state.filterType)) {
                                checked[_this.state.filterType] = {};
                                checked[_this.state.filterType][item.slug] = item.label;
                            } else {
                                if(!checked[_this.state.filterType].hasOwnProperty(item.slug)) {
                                    delete checked[_this.state.filterType][_this.state.oldChecked];
                                    checked[_this.state.filterType][item.slug] = item.label;
                                } else {
                                    delete checked[_this.state.filterType][item.slug];
                                }
                            }

                            if(_this.state.oldChecked != item.slug) {
                                _this.setState({
                                    oldChecked: item.slug
                                })
                            }

                            _this.props.navigation.state.params._setCheckedFilterParams(_this.state.filterType, checked[_this.state.filterType]);
                            _this.props.navigation.goBack();
                        }}>
                            <View>
                                <Image style={styles.similarImg} source={{uri: item.logo}}/>
                                <Text style={styles.title}>{item.label}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    keyExtractor={({item}, index) => index.toString()}
                    numColumns={3}
                />
            </View>
        );
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

    invisibleBlock: {
        width: '30rem'
    },

    center: {
        textAlign: 'center'
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
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

    flatStyle: {
        flex: 1,
        width: '100%',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    gridItem: {
        width: '30%',
        padding: '5rem',
        borderColor: GLOBALS.COLOR.white,
        borderRadius: 7,
        borderWidth: 2,
        margin: '6rem'
    },

    gridBorderItem: {
        width: '30%',
        padding: '5rem',
        borderRadius: 7,
        borderWidth: 2,
        margin: '6rem'
    },

    similarImg: {
        height: '60rem',
        resizeMode: 'contain',
        margin: '7rem'
    },

    title: {
        fontSize: '13rem',
        color: GLOBALS.COLOR.gray88,
        textAlign: 'center'
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