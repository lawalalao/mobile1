import React from 'react';
import PropTypes from 'prop-types';
import {Dimensions, View, Image, Text, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationActions } from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';
import GLOBAL from '../constants/globals';

import Ico from './Ico'

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this = this;

class ListViewItemComponent extends React.Component {
    static propTypes = {
        invId: PropTypes.number.isRequired,
        featureImg: PropTypes.string,
        title: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        imgsSrc: PropTypes.array,
        imgsNum: PropTypes.number,
        infOneIcon: PropTypes.string,
        infOneTitle: PropTypes.string,
        infOneDesc: PropTypes.string,
        infTwoIcon: PropTypes.string,
        infTwoTitle: PropTypes.string,
        infTwoDesc: PropTypes.string,
        infThreeIcon: PropTypes.string,
        infThreeTitle: PropTypes.string,
        infThreeDesc: PropTypes.string,
        infFourIcon: PropTypes.string,
        infFourTitle: PropTypes.string,
        infFourDesc: PropTypes.string,
        editFunc: PropTypes.func,
        hasPadding: PropTypes.bool,
        doReplace: PropTypes.bool
    };

    constructor(props) {
        super(props);

        _this = this;

        this.state = {
            listViewStyle: '',
            mainColor: '',
            secondColor: ''
        }
    }

    async componentWillMount() {

        try {
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');

            _this.setState({
                mainColor: mc,
                secondColor: sc
            })

            let listView = await AsyncStorage.getItem('listViewStyle');
            this.setState({listViewStyle: listView});
        } catch (e) {
            console.log("error from AsyncStorage: ", e);
        }
    }

    render() {
        const {
            invId, featureImg, title, price, imgsSrc, imgsNum,
            infOneIcon, infOneTitle, infOneDesc,
            infTwoIcon, infTwoTitle, infTwoDesc,
            infThreeIcon, infThreeTitle, infThreeDesc,
            infFourIcon, infFourTitle, infFourDesc, editFunc, hasPadding, doReplace
        } = this.props;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                doReplace
                    ? this.props.navigation.replace('Details', {listingId: invId})
                    : this.props.navigation.navigate('Details', {listingId: invId})
            }} onLongPress={() => {
                if(typeof(editFunc) == 'function') {
                    let itemObj = {
                        ID: invId,
                        url: featureImg,
                        price: price,
                        title: title,
                        icoOne: infOneIcon,
                        titleOne: infOneTitle,
                        descOne: infOneDesc,
                        icoTwo: infTwoIcon,
                        titleTwo: infTwoTitle,
                        descTwo: infTwoDesc,
                        icoThree: infThreeIcon,
                        titleThree: infThreeTitle,
                        descThree: infThreeDesc,
                        icoFour: infFourIcon,
                        titleFour: infFourTitle,
                        descFour: infFourDesc,
                    };

                    editFunc(itemObj);
                }
            }}>
                <View style={[style.wrapper, hasPadding ? style.padLR : '']}>
                    <View>
                        <Image style={style.img} source={{uri: featureImg}}/>
                        <View style={[style.priceWrap, {backgroundColor: _this.state.mainColor}]}><Text style={style.price}>{price}</Text></View>
                    </View>
                    <View style={style.flexRow}>
                        <View style={style.titleWrap}>
                            <Text style={style.title} numberOfLines={1}>{title}</Text>
                        </View>
                        <View style={style.InfoMainWrap}>
                            <View style={style.infoWrap}>
                                {/*<View style={style.icoStyle}>
                                    <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={12} icoName={infOneIcon}/>
                                </View>*/}
                                <View>
                                    <Text style={style.infoDataTopWrap} numberOfLines={1}>{infOneTitle}</Text>
                                    <Text style={style.infoDataBottomWrap} numberOfLines={1}>{infOneDesc}</Text>
                                </View>
                            </View>
                            <View style={style.infoWrap}>
                                {/*<View style={style.icoStyle}>
                                    <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={12} icoName={infTwoIcon}/>
                                </View>*/}
                                <View>
                                    <Text style={style.infoDataTopWrap} numberOfLines={1}>{infTwoTitle}</Text>
                                    <Text style={style.infoDataBottomWrap} numberOfLines={1}>{infTwoDesc}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={style.InfoMainWrap}>
                            <View style={style.infoWrap}>
                                {/*<View style={style.icoStyle}>
                                    <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={12} icoName={infThreeIcon}/>
                                </View>*/}
                                <View>
                                    <Text style={style.infoDataTopWrap} numberOfLines={1}>{infThreeTitle}</Text>
                                    <Text style={style.infoDataBottomWrap} numberOfLines={1}>{infThreeDesc}</Text>
                                </View>
                            </View>
                            <View style={style.infoWrap}>
                                {/*<View style={style.icoStyle}>
                                    <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={12} icoName={infFourIcon}/>
                                </View>*/}
                                <View>
                                    <Text style={style.infoDataTopWrap} numberOfLines={1}>{infFourTitle}</Text>
                                    <Text style={style.infoDataBottomWrap} numberOfLines={1}>{infFourDesc}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const style = EStyleSheet.create({
    wrapper: {
        position: 'relative',
        marginBottom: '20rem',
        paddingTop: '20rem',
        borderTopWidth: 0.5,
        borderTopColor: GLOBAL.COLOR.gray88,
        borderStyle: 'solid',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },

    img: {
        width: '160rem',
        height: '107rem',
    },

    flexRow: {
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingLeft: 5
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
        color: GLOBAL.COLOR.white
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
        color: GLOBAL.COLOR.title,
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
        alignItems: 'flex-start',
        padding: '5rem',
    },

    icoStyle: {
        width: '15rem',
        marginRight: '3rem'
    },

    infoDataTopWrap: {
        fontSize: 13,
        color: GLOBAL.COLOR.gray88
    },

    infoDataAbsWrap: {
        fontSize: 13,
        color: GLOBAL.COLOR.white
    },

    infoDataBottomWrap: {
        fontSize: 13,
        color: GLOBAL.COLOR.title,
        fontWeight: 'bold'
    },

    padLR: {
        paddingLeft: '20rem',
        paddingRight: '20rem',
    }
});

export default ListViewItemComponent;