import React from 'react';
import {
    Dimensions,
    FlatList,
    ActivityIndicator,
    Text,
    View,
    TouchableOpacity
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import EStyleSheet from 'react-native-extended-stylesheet';
import {getFilteredListings} from "../helpers/MotorsRestApi"
import GridViewItem from '../components/GridViewItemComponent'
import ListViewItem from '../components/ListViewItemComponent'
import GLOBALS from '../constants/globals';
import _ from 'lodash';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});
import Ico from '../components/Ico';

let _this;

let requestSended = false;

export default class Inventory extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        this.state = {
            loadMore: false,
            isLoading: true,
            dataListings: {},
            inventoryView: '',
            filterData: '',
            limit: 0,
            offset: 0
        };
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
                    <Text style={styles.center}><Translation str='result'/></Text>
                </View>
            ),
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        navigation.goBack();
                    }}>
                        <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: (<View style={styles.invisibleBlock}></View>),
        }
    }

    async componentWillMount() {
        this.setState({
            filterData: this.props.navigation.state.params.filter_data
        });

        try {
            let invView = await AsyncStorage.getItem('inventoryView');
            this.setState({inventoryView: invView});
        } catch (e) {
            console.log("error from AsyncStorage Inventory View: ", e);
        }

        _this._getFilteredListings();
    }

    buildQuery(limit) {
        let str = '';

        _.map(_this.state.filterData, function (val, key) {
            if (typeof(val) != 'object') {
                str += '&' + key + '=' + val
            } else {
                let index = 0;
                _.map(val, function (v, k) {
                    str += '&' + key + '[' + index + ']=' + k
                    index += 1;
                })
            }
        });

        str += '&limit=' + limit + '&offset=' + _this.state.offset;

        return str;
    }

    _deleteFilterParam = (type, key) => {
        _this.setState({
            isLoading: true
        });

        let filterParams = _this.state.filterData;
        delete filterParams[type];

        _this.setState({
            filterData: filterParams,
            limit: 0,
            offset: 0
        })

        _this._getFilteredListings();
    }

    _getFilteredListings = () => {
        getFilteredListings(_this.buildQuery(10)).then((responceJSON) => {
            _this.setState({
                isLoading: false,
                dataListings: responceJSON.listings,
                limit: responceJSON.limit,
                offset: responceJSON.offset
            }, function () {

            })

            requestSended = false;
        });
    }

    _loadListings = () => {
        if(_this.state.limit != 0 && _this.state.offset != 0) {
            _this.setState({
                loadMore: true
            })

            getFilteredListings(_this.buildQuery(_this.state.limit)).then((responceJSON) => {
                _this.setState({
                    isLoading: false,
                    loadMore: false,
                    dataListings: _this.state.dataListings.concat(responceJSON.listings),
                    limit: responceJSON.limit,
                    offset: responceJSON.offset
                }, function () {

                })

                requestSended = false;
            });
        }
    }

    _footerComponent = () => {
        if (_this.state.loadMore) {
            return (
                <View style={styles.indicatorWrap}>
                    <ActivityIndicator/>
                </View>
            );
        } else {
            return (<View style={styles.indicatorWrap}></View>);
        }
    }

    render() {
        if (_this.state.isLoading) {
            return (
                <View style={{flex: 1, alignItems: 'center', paddingTop: 100}}><ActivityIndicator/></View>
            )
        }

        return (
            <View style={styles.container}>
                <View style={styles.filters}>
                    {
                        _.map(_this.state.filterData, function (val, key) {
                            let str = '';

                            if (typeof(val) != 'object') {
                                str = val
                            } else {
                                let i = 0;
                                _.map(val, function (v, k) {
                                    if (i != 0) str += ', '

                                    str += v

                                    i += 1
                                })
                            }

                            return (
                                <TouchableOpacity
                                    activeOpacity={0.8} key={key} onPress={() => {
                                    _this._deleteFilterParam(key, val);
                                }}>
                                    <View style={styles.filterItem}>
                                        <Text style={styles.filterTitle}>{str}</Text>
                                        <Ico style={styles.IcoStyle} icoName='lnr-cross' icoSize={13}
                                             icoColor={GLOBALS.COLOR.gray88}></Ico>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>

                {
                    this.state.dataListings != '' ?
                        this.state.inventoryView == 'inventory_view_list' ?
                            <FlatList
                                style={styles.flatStyle}
                                data={this.state.dataListings}
                                extraData={this.state}
                                onEndReachedThreshold={0.5}
                                onEndReached={({distanceFromEnd}) => {
                                    if(!requestSended) {
                                        requestSended = true;
                                        this._loadListings();
                                    }
                                }}
                                renderItem={({item}) =>
                                    <ListViewItem navigation={this.props.navigation} invId={item.ID}
                                                  featureImg={item.imgUrl}
                                                  title={item.list.title}
                                                  price={item.price}
                                                  imgsSrc={item.gallery}
                                                  imgsNum={item.imgCount}
                                                  infOneIcon={item.list.infoOneIcon}
                                                  infOneTitle={item.list.infoOneTitle}
                                                  infOneDesc={item.list.infoOneDesc}
                                                  infTwoIcon={item.list.infoTwoIcon}
                                                  infTwoTitle={item.list.infoTwoTitle}
                                                  infTwoDesc={item.list.infoTwoDesc}
                                                  infThreeIcon={item.list.infoThreeIcon}
                                                  infThreeTitle={item.list.infoThreeTitle}
                                                  infThreeDesc={item.list.infoThreeDesc}
                                                  infFourIcon={item.list.infoFourIcon}
                                                  infFourTitle={item.list.infoFourTitle}
                                                  infFourDesc={item.list.infoFourDesc}
                                                  hasPadding={false}
                                                  doReplace={false}
                                    />}
                                ListFooterComponent={_this._footerComponent()}
                                keyExtractor={({item}, index) => index.toString()}
                            />
                            :
                            <FlatList
                                style={styles.flatStyle}
                                data={this.state.dataListings}
                                extraData={this.state}
                                onEndReachedThreshold={0.5}
                                onEndReached={({distanceFromEnd}) => {
                                    if(!requestSended) {
                                        requestSended = true;
                                        this._loadListings();
                                    }
                                }}
                                ListFooterComponent={_this._footerComponent()}
                                renderItem={({item}) =>
                                    <GridViewItem navigation={this.props.navigation} invId={item.ID}
                                                  featureImg={item.imgUrl}
                                                  title={item.grid.title}
                                                  subtitle={item.grid.subTitle}
                                                  price={item.price}
                                                  imgsSrc={item.gallery}
                                                  imgsNum={item.imgCount}
                                                  infIcon={item.grid.infoIcon}
                                                  infTitle={item.grid.infoTitle}
                                                  infDesc={item.grid.infoDesc}
                                    />}
                                keyExtractor={({item}, index) => index.toString()}
                            />
                    :
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text><Translation str='no_results'/></Text>
                    </View>
                }

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

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
    },

    center: {
        textAlign: 'center'
    },

    indicatorWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingBottom: '10rem',
        height: '60rem'
    },

    flatStyle: {
        flex: 1,
        padding: '20rem',
        height: '100%'
    },

    filters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '15rem',
        paddingRight: '15rem',
        marginTop: '10rem'
    },


    filterItem: {
        width: 'auto',
        height: '30rem',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '6rem',
        paddingBottom: '6rem',
        paddingLeft: '13rem',
        paddingRight: '10rem',
        margin: 5,
        borderRadius: '15rem',
        backgroundColor: GLOBALS.COLOR.bg
    },

    IcoStyle: {
        paddingTop: 2,
        marginLeft: '7rem'
    },

    filterTitle: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.gray88,
        marginRight: 5
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
});