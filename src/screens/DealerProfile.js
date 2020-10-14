import React from 'react';
import {
    ScrollView,
    RefreshControl,
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image, Linking
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import {getUser, getUserListings, loadMore} from "../helpers/MotorsRestApi"
import ListViewItem from '../components/ListViewItemComponent';
import GLOBALS from '../constants/globals';
import Ico from '../components/Ico';
import AppBottomNavigation from '../components/AppBottomNavigation'
import Communications from "react-native-communications";
import AsyncStorage from "@react-native-community/async-storage";
import Translation from '../helpers/Translation';

const entireScreenWidth = Dimensions.get('window').width;
const entireScreenHeight = Dimensions.get('window').height + 50;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;

export default class DealerProfile extends React.Component {
    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            appType: 'dealership',
            isLoading: true,
            refreshing: false,
            userData: {},
            userId: 0,
            listingsData: {},
            listingsFound: 0,
            loadMore: false,
            invLimit: 10,
            invOffset: 0,
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
                    <Text style={styles.center}><Translation str='dealer_profile'/></Text>
                </View>
            ),
            headerLeft: (<View>
                <TouchableOpacity
                    activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                    navigation.goBack();
                }}>
                    <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                </TouchableOpacity>
            </View>),
            headerRight: (<View style={styles.invisibleBlock}></View>),
        }
    };

    async componentWillMount() {
        try {
            let apptype = await AsyncStorage.getItem('app_type');
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');

            _this.setState({
                appType: apptype,
                mainColor: mc,
                secondColor: sc
            })
        } catch (e) {
            console.log("error from AsyncStorage Colors: ", e);
        }
        
        _this.setState({
            userId: _this.props.navigation.state.params.userId
        });

        await getUser(_this.props.navigation.state.params.userId).then((responceJSON) => {
            _this.setState({
                isLoading: false,
                refreshing: false,
                userData: responceJSON,
                listingsData: responceJSON.listings,
                invOffset: Object.keys(responceJSON.listings).length
            }, function () {
            })
        })
    }

    _onRefresh = () => {
        _this.setState({refreshing: true});
        getUser(_this.state.userId).then((responceJSON) => {
            _this.setState({
                isLoading: false,
                refreshing: false,
                userData: responceJSON,
                listingsData: responceJSON.listings
            }, function () {

            })
        })
    };

    _headerComponent = () => {

        let user = _this.state.userData.author;

        return (
            <View style={styles.wrap}>
                <View style={styles.userInfo}>
                    <View style={styles.logoWrap}>
                        <Image style={styles.logo}
                               source={(user.logo != '') ? {uri: user.logo} : require('../assets/img/empty_dealer_logo.png')}/>
                    </View>
                    <Text style={styles.compName}>{user.stm_company_name}</Text>
                    <Text style={styles.compLocation}>{user.location}</Text>
                </View>
                { (_this.state.appType != 'dealership') ?
                    <View style={styles.authorInfoWrap}>
                        <TouchableOpacity activeOpacity={0.8} style={styles.callBtnWrap} onPress={() => {
                            Linking.openURL('tel:' + user.phone);
                        }}>
                            <View style={[styles.callBtn, {backgroundColor: _this.state.secondColor}]}>
                                <Ico icoName='phone-handset' icoSize={18} icoColor={GLOBALS.COLOR.white}/>
                                <Text style={styles.phoneText}>{user.phone}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} style={styles.messBtnWrap} onPress={() => {
                            Communications.text(user.phone);
                        }}>
                            <View style={styles.messBtn}>
                                <Ico icoName='bubble-dots' icoSize={18} icoColor={GLOBALS.COLOR.grayBlue}/>
                                <Text style={styles.messText}><Translation str='send_message'/></Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    :
                    <View></View>
                }
                <Text style={styles.mainTitle}><Translation str='sellers_inventory'/></Text>
            </View>
        )
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

    _loadMore = () => {
        let params = 'user_id=' + _this.state.userId + '&limit=' + _this.state.invLimit + '&offset=' + _this.state.invOffset;

        loadMore(params).then((responseJson) => {
            _this.setState({
                listingsFound: responseJson.listings_found,
                listingsData: _this.state.listingsData.concat(responseJson.listings),
                invLimit: responseJson.limit,
                invOffset: responseJson.offset,
                loadMore: false
            })
        })
    }

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

        return (

            <View style={styles.container}>
                <View style={styles.inventoryWrap}>
                    <FlatList
                        style={styles.flatStyle}
                        data={_this.state.listingsData}
                        extraData={_this.state}
                        ListHeaderComponent={_this._headerComponent}
                        refreshing={_this.state.refreshing}
                        onRefresh={_this._onRefresh}
                        onEndReachedThreshold={0.05}
                        showsHorizontalScrollIndicator={false}
                        onEndReached={({distanceFromEnd}) => {
                            if (_this.state.invOffset != 0) {
                                _this.setState({
                                    loadMore: true
                                })
                                this._loadMore();
                            }
                        }}
                        renderItem={({item}) =>
                            <ListViewItem navigation={_this.props.navigation} invId={item.ID}
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
                                          doReplace={true}
                            />}
                        ListFooterComponent={_this._footerComponent()}
                        keyExtractor={({item}, index) => index.toString()}
                    />
                </View>
                <AppBottomNavigation navigation={_this.props.navigation} activeTab='lnr-user'/>
            </View>
        );
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

    content: {
        position: 'absolute',
        top: 50,
        left: 50
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
    },

    invisibleBlock: {
        width: '30rem'
    },

    mainTitle: {
        fontSize: '14rem',
        fontWeight: '700',
        paddingTop: '20rem',
        paddingBottom: '20rem',
        textAlign: 'center'
    },

    center: {
        textAlign: 'center'
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

    indicatorWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingBottom: '10rem',
        height: '60rem'
    },

    userInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '30rem',
    },

    compName: {
        fontSize: '16rem',
        color: GLOBALS.COLOR.title
    },

    compLocation: {
        fontSize: '13rem',
        color: GLOBALS.COLOR.gray88
    },

    logoWrap: {
        width: '30%',
        borderWidth: 0.5,
        borderColor: GLOBALS.COLOR.gray88,
        borderStyle: 'solid',
        borderRadius: '3rem',
        marginBottom: '15rem',
        paddingLeft: '5rem',
        paddingRight: '5rem',
    },

    logo: {
        width: '100%',
        height: '34rem',
        resizeMode: 'contain',
    },


    authorInfoWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: '20rem',
        marginBottom: '10rem',
    },

    callBtnWrap: {
        width: '45%',
    },

    callBtn: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        height: '55rem',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },

    messBtnWrap: {
        width: '45%',
    },

    messBtn: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        height: '55rem',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GLOBALS.COLOR.white,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },

    phoneText: {
        fontSize: '13rem',
        color: GLOBALS.COLOR.white,
        marginLeft: 5
    },

    messText: {
        fontSize: '13rem',
        color: GLOBALS.COLOR.grayBlue,
        marginLeft: 5
    },

    inventoryWrap: {
        flex: 1,
        paddingLeft: '20rem',
    },

    flatStyle: {
        paddingRight: '20rem'
    }
})