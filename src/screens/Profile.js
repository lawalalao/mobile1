import React from 'react';
import {
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    Image, Linking
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import AppBottomNavigation from '../components/AppBottomNavigation'
import ListViewItem from '../components/ListViewItemComponent';
import {loadMore, loadMoreFavourites, deleteACar, getLogedUser, removeFromFavorite} from "../helpers/MotorsRestApi";
import ProfileMenu from '../components/ProfileMenu';

import Toast, {DURATION} from 'react-native-easy-toast'

const entireScreenWidth = Dimensions.get('window').width;
const entireScreenHeight = Dimensions.get('window').height;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;

let popupObj = {};

export default class Profile extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            appType: 'dealership',
            isLoading: true,
            refreshing: false,
            userData: {},
            userId: 0,
            userToken: '',
            listingsData: {},
            favouritesData: {},
            popup_update: false,
            deleted: false,
            listingsFound: 0,
            favouritesFound: 0,
            invLimit: 5,
            invOffset: 5,
            favLimit: 5,
            favOffset: 5,
            loadData: false,
            mainColor: '#1bc744',
            secondColor: '#2d60f3'
        };

        _this._showEditPopup = _this._showEditPopup.bind(_this);
    }

    async componentWillMount() {
        try {
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');
            let apptype = await AsyncStorage.getItem('app_type');

            _this.setState({
                appType: apptype,
                mainColor: mc,
                secondColor: sc
            })
            
            let user = await AsyncStorage.getItem('userData');
            user = JSON.parse(user);

            this.setState({userData: user, userId: user.ID, userToken: user.token});
        } catch (e) {
            console.log("error from AsyncStorage Profile: ", e);
        }

        await getLogedUser(_this.state.userId).then((responceJSON) => {
            _this.setState({
                isLoading: false,
                refreshing: false,
                userData: responceJSON,
                listingsFound: responceJSON.listings_found,
                favouritesFound: responceJSON.favourites_found,
                listingsData: (responceJSON.hasOwnProperty('listings')) ? responceJSON.listings : {},
                favouritesData: (responceJSON.hasOwnProperty('favourites')) ? responceJSON.favourites : {},
            }, function () {

            })
        })
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
                    <Text style={styles.center}>Profile</Text>
                </View>
            ),
            headerLeft: (<View style={styles.invisibleBlock}></View>),
            headerRight: (
                <View>
                    <ProfileMenu navigation={navigation} currentPage={{curPage: 'profile'}}/>
                </View>),
        }
    };

    _onRefresh = () => {
        _this.setState({refreshing: true});
        getLogedUser(_this.state.userId).then((responceJSON) => {
            _this.setState({
                isLoading: false,
                refreshing: false,
                userData: responceJSON,
                listingsData: (responceJSON.hasOwnProperty('listings')) ? responceJSON.listings : {},
                favouritesData: (responceJSON.hasOwnProperty('favourites')) ? responceJSON.favourites : {},
                listingsFound: responceJSON.listings_found,
                favouritesFound: responceJSON.favourites_found,
                loadData: false
            }, function () {
            })
        })
    };

    _showEditPopup = (itemObj) => {
        popupObj = itemObj;
        _this.setState({
            popup_update: true
        })
    }

    _closeEditPopup = () => {
        popupObj = {};
        _this.setState({
            popup_update: false,
            deleted: false
        })
    }

    _goToEditCar = () => {
        this.props.navigation.navigate('AddACarStepOne', {editMode: true, listingId: popupObj.ID});
        _this._closeEditPopup();
    }

    _deleteCar = () => {
        _this.setState({
            deleted: true
        })
        const formData = new FormData();

        formData.append('user_id', _this.state.userId);
        formData.append('user_token', _this.state.userToken);
        formData.append('post_id', popupObj.ID);

        deleteACar(formData).then((responceJSON) => {
            if (responceJSON.status == 200) {
                _this._closeEditPopup();
                _this._onRefresh();
            }

            _this._showToast(responceJSON.message);
        }).catch(err => {
            console.error("error delete car: ", err);
        });
    }

    _removeFromFavorites = (listingId) => {
        const formData = new FormData();

        formData.append('user_id', _this.state.userId);
        formData.append('user_token', _this.state.userToken);
        formData.append('carId', listingId);
        formData.append('action', 'remove');

        removeFromFavorite(formData).then((responseJSON) => {
            _this._showToast(responseJSON.message);

            _this.setState({
                refreshing: false,
                favouritesFound: responseJSON.favourites_found,
                favouritesData: responseJSON.favourites,
                favLimit: responseJSON.limit,
                favOffset: responseJSON.offset,
                deleteFav: false
            })
        })
        .catch(err => {
            _this._showToast(err);
        });
    }

    _loadMore = () => {

        let params = 'user_id=' + _this.state.userId + '&limit=' + _this.state.invLimit + '&offset=' + _this.state.invOffset;

        loadMore(params).then((responseJson) => {
            _this.setState({
                listingsFound: responseJson.listings_found,
                listingsData: _this.state.listingsData.concat(responseJson.listings),
                invLimit: responseJson.limit,
                invOffset: responseJson.offset,
                loadData: false
            })
        })
    }

    _loadMoreFavourites = () => {

        let params = 'user_id=' + _this.state.userId + '&limit=' + _this.state.favLimit + '&offset=' + _this.state.favOffset;

        loadMoreFavourites(params).then((responseJson) => {
            _this.setState({
                favouritesFound: responseJson.favourites_found,
                favouritesData: _this.state.favouritesData.concat(responseJson.favourites),
                favLimit: responseJson.limit,
                favOffset: responseJson.offset,
                loadData: false
            })
        })
    }

    _footerComponent = () => {

        let foundListings = _this.state.listingsFound;

        if (_this.state.invOffset < foundListings) {
            return (
                <View>
                    {
                        _this.state.loadData
                            ?
                            <View style={styles.lmPreloader}>
                                <ActivityIndicator/>
                            </View>
                            :
                            <TouchableOpacity
                                activeOpacity={0.8} style={[styles.loadMoreBtn, {backgroundColor: _this.state.mainColor}]} onPress={() => {
                                _this.setState({
                                    loadData: true
                                })

                                _this._loadMore();
                            }}>
                                <Text style={styles.loadMoreText}><Translation str='load_more'/></Text>
                            </TouchableOpacity>
                    }
                </View>
            )
        } else {
            return (<View></View>)
        }
    }

    _footerFavoritesComponent = () => {
        let foundListings = _this.state.favouritesFound;

        if (_this.state.favOffset < foundListings) {
            return (
                <View>
                    {
                        _this.state.loadData
                            ?
                            <View style={styles.lmPreloader}>
                                <ActivityIndicator/>
                            </View>
                            :
                            <TouchableOpacity
                                activeOpacity={0.8} style={[styles.loadMoreBtn, {backgroundColor: _this.state.mainColor}]} onPress={() => {
                                _this.setState({
                                    loadData: true
                                })

                                _this._loadMoreFavourites();
                            }}>
                                <Text style={styles.loadMoreText}><Translation str='load_more'/></Text>
                            </TouchableOpacity>
                    }
                </View>
            )
        } else {
            return (<View></View>)
        }
    }

    _showToast = (text, color) => {
        _this.refs['toast'].show(text, 3000);
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

        let user = _this.state.userData.author;
        const editIco = (<Ico icoName='lnr-menu' icoColor={GLOBALS.COLOR.gray88} icoSize={30}/>);

        return (
            <View style={styles.container}>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={_this.state.refreshing}
                            onRefresh={_this._onRefresh}
                        />
                    }
                >
                    <View style={styles.wrap}>
                        <View style={styles.userInfo}>
                            <View style={styles.logoWrap}>
                                <Image style={styles.logo}
                                       source={(user.image != '') ? {uri: user.image} : require('../assets/img/avatarplchldr.png')}/>
                            </View>
                            <Text style={styles.compName}>{user.name + ' ' + user.last_name}</Text>
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
                                    _this._showToast('Coming Soon')
                                }}>
                                    <View style={styles.messBtn}>
                                        <Ico icoName='bubble-dots' icoSize={18} icoColor={GLOBALS.COLOR.grayBlue}/>
                                        <Text style={styles.messText}>Send Message</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            :
                            <View></View>
                        }
                    </View>
                    <View style={styles.inventoryWrap}>
                        <Text style={styles.mainTitle}><Translation str='my_inventory'/></Text>
                        {
                            Object.keys(_this.state.listingsData).length > 0
                                ?
                                <FlatList
                                    style={styles.flatStyle}
                                    data={_this.state.listingsData}
                                    extraData={_this.state}
                                    ListFooterComponent={_this._footerComponent()}
                                    renderItem={({item}) =>
                                        <ListViewItem navigation={_this.props.navigation}
                                                      invId={item.ID}
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
                                                      editFunc={_this._showEditPopup}
                                                      hasPadding={false}
                                                      doReplace={false}
                                        />}
                                    keyExtractor={({item}, index) => index.toString()}
                                />
                                :
                                <Text style={{textAlign: 'center'}}><Translation str='inventory_empty'/></Text>
                        }

                    </View>
                    <View style={styles.inventoryWrap}>
                        <Text style={styles.mainTitle}><Translation str='my_favourites'/></Text>
                        {
                            (_this.state.favouritesData != null && Object.keys(_this.state.favouritesData).length > 0)
                                ?
                                <FlatList
                                    style={styles.flatStyle}
                                    data={_this.state.favouritesData}
                                    extraData={_this.state}
                                    ListFooterComponent={_this._footerFavoritesComponent()}
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
                                                      doReplace={false}
                                        />}
                                    keyExtractor={({item}, index) => index.toString()}
                                />
                                :
                                <Text style={{textAlign: 'center', marginTop: 20}}><Translation str='favourites_empty'/></Text>
                        }

                    </View>
                </ScrollView>
                {
                    _this.state.popup_update
                        ?
                        <TouchableOpacity
                            activeOpacity={0.8} style={styles.popupWrap} onPress={() => {
                            _this._closeEditPopup()
                        }}>
                            <View style={styles.opacityBg}></View>
                            <View style={styles.wrapper}>
                                <View>
                                    <Image style={styles.img} source={{uri: popupObj.url}}/>
                                    <View style={[styles.priceWrap, {backgroundColor: _this.state.mainColor}]}><Text
                                        style={styles.price}>{popupObj.price}</Text></View>
                                </View>
                                <View style={styles.flexRow}>
                                    <View style={styles.titleWrap}>
                                        <Text style={styles.title} numberOfLines={1}>{popupObj.title}</Text>
                                    </View>
                                    <View style={styles.InfoMainWrap}>
                                        <View style={styles.infoWrap}>
                                            <View style={styles.icoStyle}>
                                                <Ico icoColor={GLOBALS.COLOR.gray88} icoSize={12}
                                                     icoName={popupObj.icoOne}/>
                                            </View>
                                            <View>
                                                <Text style={styles.infoDataTopWrap}
                                                      numberOfLines={1}>{popupObj.titleOne}</Text>
                                                <Text style={styles.infoDataBottomWrap}
                                                      numberOfLines={1}>{popupObj.descOne}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.infoWrap}>
                                            <View style={styles.icoStyle}>
                                                <Ico icoColor={GLOBALS.COLOR.gray88} icoSize={12}
                                                     icoName={popupObj.icoTwo}/>
                                            </View>
                                            <View>
                                                <Text style={styles.infoDataTopWrap}
                                                      numberOfLines={1}>{popupObj.titleTwo}</Text>
                                                <Text style={styles.infoDataBottomWrap}
                                                      numberOfLines={1}>{popupObj.descTwo}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.InfoMainWrap}>
                                        <View style={styles.infoWrap}>
                                            <View style={styles.icoStyle}>
                                                <Ico icoColor={GLOBALS.COLOR.gray88} icoSize={12}
                                                     icoName={popupObj.icoThree}/>
                                            </View>
                                            <View>
                                                <Text style={styles.infoDataTopWrap}
                                                      numberOfLines={1}>{popupObj.titleThree}</Text>
                                                <Text style={styles.infoDataBottomWrap}
                                                      numberOfLines={1}>{popupObj.descThree}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.infoWrap}>
                                            <View style={styles.icoStyle}>
                                                <Ico icoColor={GLOBALS.COLOR.gray88} icoSize={12}
                                                     icoName={popupObj.icoFour}/>
                                            </View>
                                            <View>
                                                <Text style={styles.infoDataTopWrap}
                                                      numberOfLines={1}>{popupObj.titleFour}</Text>
                                                <Text style={styles.infoDataBottomWrap}
                                                      numberOfLines={1}>{popupObj.descFour}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.popupBtnsWrap}>
                                <TouchableOpacity
                                    activeOpacity={0.8} style={[styles.editButton, {backgroundColor: _this.state.mainColor}]} onPress={() => {
                                    _this._goToEditCar();
                                }}>
                                    <Ico icoName='author' icoColor={GLOBALS.COLOR.white} icoSize={16}/>
                                    <Text style={{
                                        marginLeft: 10,
                                        fontSize: 15,
                                        fontWeight: '600',
                                        color: GLOBALS.COLOR.white
                                    }}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8} style={styles.deleteButton} onPress={() => {
                                    _this._deleteCar()
                                }}>
                                    {
                                        _this.state.deleted
                                            ?

                                            <ActivityIndicator/>
                                            :
                                            <View style={styles.delBtnWrap}>
                                                <Ico icoName='trash' icoColor={GLOBALS.COLOR.title} icoSize={16}/>
                                                <Text style={{
                                                    marginLeft: 10,
                                                    fontSize: 15,
                                                    fontWeight: '600',
                                                    color: GLOBALS.COLOR.title
                                                }}>Delete</Text>
                                            </View>
                                    }
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                        : <View></View>
                }
                <Toast ref="toast" positionValue={180}/>
                <AppBottomNavigation navigation={_this.props.navigation} activeTab='lnr-user'/>
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
        color: GLOBALS.COLOR.title,
        borderBottomColor: GLOBALS.COLOR.gray88,
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
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

    userInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '30rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
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
        width: '100rem',
        height: '100rem',
        borderWidth: 1,
        borderColor: GLOBALS.COLOR.gray88,
        borderStyle: 'solid',
        borderRadius: '50rem',
        marginBottom: '15rem',
    },

    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: '50rem',
    },

    swipeItem: {
        width: '100rem',
        height: '146rem',
        backgroundColor: '#ff0000',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        color: GLOBALS.COLOR.white,
        marginTop: '1rem',
        paddingLeft: '10rem',
        paddingRight: '10rem',
    },

    authorInfoWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: '20rem',
        marginBottom: '10rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
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
        shadowRadius: 3,
        elevation: 2,
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
        shadowRadius: 3,
        elevation: 2,
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
        paddingLeft: '20rem',
        paddingRight: '20rem'
    },

    popupWrap: {
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
    },

    wrapper: {
        position: 'relative',
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        backgroundColor: GLOBALS.COLOR.white,
        padding: '20rem'
    },

    opacityBg: {
        flex: 1,
        width: '100%',
        backgroundColor: '#000000',
        opacity: .7,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },

    img: {
        width: '160rem',
        height: '120rem',
    },

    flexRow: {
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingLeft: 5,
    },

    priceWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '80rem',
        position: 'absolute',
        top: 0,
        right: 0,
        paddingTop: 5,
        paddingBottom: 5
    },

    price: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14rem',
        fontWeight: '600',
        color: GLOBALS.COLOR.white
    },

    titleWrap: {
        width: '100%',
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '5rem',
        paddingRight: '5rem',
    },

    title: {
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        fontWeight: '700'
    },

    InfoMainWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        width: '100%'
    },

    infoWrap: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '5rem',
    },

    icoStyle: {
        width: '15rem',
        marginRight: '3rem'
    },

    infoDataTopWrap: {
        fontSize: 13,
        color: GLOBALS.COLOR.gray88
    },

    infoDataAbsWrap: {
        fontSize: 13,
        color: GLOBALS.COLOR.white
    },

    infoDataBottomWrap: {
        fontSize: 13,
        color: GLOBALS.COLOR.title,
        fontWeight: 'bold'
    },

    popupBtnsWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20rem'
    },

    editButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
        minWidth: '80rem',
        height: '55rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        borderRadius: 30,
        marginLeft: '10rem'
    },

    deleteButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
        minWidth: '80rem',
        height: '55rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        backgroundColor: GLOBALS.COLOR.white,
        borderRadius: 30,
        marginLeft: '10rem'
    },

    delBtnWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
    },

    loadMoreBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '40rem',
        marginBottom: '20rem',
        borderRadius: '20rem'
    },

    lmPreloader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '40rem',
        marginBottom: '20rem',
    },

    loadMoreText: {
        fontSize: '12rem',
        color: GLOBALS.COLOR.white
    }
});