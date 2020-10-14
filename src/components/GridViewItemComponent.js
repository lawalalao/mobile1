import React from 'react';
import PropTypes from 'prop-types';
import {Dimensions, View, Image, Text, TouchableOpacity} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import {createStackNavigator, createAppContainer, StackActions, NavigationActions} from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';
import GLOBAL from '../constants/globals';
import Ico from './Ico'

import AsyncStorage from '@react-native-community/async-storage';
const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');

let _this;

class GridViewItemComponent extends React.Component {
    static propTypes = {
        invId: PropTypes.number.isRequired,
        featureImg: PropTypes.string,
        title: PropTypes.string.isRequired,
        subtitle: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        imgsSrc: PropTypes.array,
        imgsNum: PropTypes.number,
        infIcon: PropTypes.string,
        infTitle: PropTypes.string,
        infDesc: PropTypes.string,
    };

    constructor(props) {
        super(props);

        _this = this;

        this.state = {
            gridViewStyle: '',
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

            let gridView = await AsyncStorage.getItem('gridViewStyle');
            this.setState({gridViewStyle: gridView});
        } catch (e) {
            console.log("error from AsyncStorage: ", e);
        }
    }

    _renderCarouselItem({item, index}) {
        return (
            <View style={style.slide}>
                <Image style={style.img} source={{uri: item.url}}/>
            </View>
        );
    }

    render() {
        const {invId, featureImg, title, subtitle, price, imgsSrc, imgsNum, infIcon, infTitle, infDesc} = this.props;

        switch (this.state.gridViewStyle) {
            case 'grid_two':
                return (
                    <TouchableOpacity
                        activeOpacity={0.8} onPress={() => {
                        this.props.navigation.navigate('Details', {listingId: invId});
                    }}>
                        <View style={style.wrapper}>
                            <View>
                                {
                                    imgsSrc.length > 1 ?
                                        <Carousel
                                            ref={(c) => {
                                                this._carousel = c;
                                            }}
                                            data={imgsSrc}
                                            renderItem={this._renderCarouselItem}
                                            sliderWidth={viewportWidth}
                                            itemWidth={viewportWidth}
                                            slideStyle={{width: viewportWidth}}
                                        />
                                        :
                                        <Image style={style.img} source={{uri: featureImg}}/>
                                }

                                <View style={style.infoTwoAbsoluteWrap}>
                                    <View style={style.icoStyle}>
                                        <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={12} icoName='camera'/>
                                    </View>
                                    <View>
                                        <Text style={style.infoDataAbsWrap} numberOfLines={1}>{imgsNum}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={style.flexRow}>
                                <View style={[style.priceWrap, {backgroundColor: _this.state.mainColor}]}><Text style={style.price}>{price}</Text></View>
                                <View style={style.titleTwoWrap}>
                                    <Text style={style.subTitle} numberOfLines={1}>{subtitle}</Text>
                                    <Text style={style.title} numberOfLines={1}>{title}</Text>
                                </View>
                                <View style={style.infoTwoWrap}>
                                    <View style={style.icoStyle}>
                                        <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={14} icoName={infIcon}/>
                                    </View>
                                    <View>
                                        <Text style={style.infoDataTopWrap} numberOfLines={1}>{infTitle}</Text>
                                        <Text style={style.infoDataBottomWrap} numberOfLines={1}>{infDesc}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            case 'grid_three':
                return (
                    <TouchableOpacity
                        activeOpacity={0.8} onPress={() => {
                        this.props.navigation.navigate('Details', {listingId: invId});
                    }}>
                        <View style={style.wrapper}>
                            <View>
                                {
                                    imgsSrc.length > 1 ?
                                        <Carousel
                                            ref={(c) => {
                                                this._carousel = c;
                                            }}
                                            data={imgsSrc}
                                            renderItem={this._renderCarouselItem}
                                            sliderWidth={viewportWidth}
                                            itemWidth={viewportWidth}
                                            slideStyle={{width: viewportWidth}}
                                        />
                                        :
                                        <Image style={style.img} source={{uri: featureImg}}/>
                                }
                            </View>
                            <View style={style.flexRow}>
                                <View style={[style.priceWrap, {backgroundColor: _this.state.mainColor}]}><Text style={style.price}>{price}</Text></View>
                                <View style={style.titleTwoWrap}>
                                    <Text style={style.subTitle} numberOfLines={1}>{subtitle}</Text>
                                    <Text style={style.title} numberOfLines={1}>{title}</Text>
                                </View>
                                <View style={style.infoTwoWrap}>
                                    <View style={style.icoStyle}>
                                        <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={14} icoName={infIcon}/>
                                    </View>
                                    <View>
                                        <Text style={style.infoDataTopWrap} numberOfLines={1}>{infTitle}</Text>
                                        <Text style={style.infoDataBottomWrap} numberOfLines={1}>{infDesc}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            default:
                return (
                    <TouchableOpacity
                        activeOpacity={0.8} onPress={() => {
                        this.props.navigation.navigate('Details', {listingId: invId});
                    }}>
                        <View style={style.wrapper}>
                            <View>
                                {
                                    imgsSrc.length > 1 ?
                                        <Carousel
                                            ref={(c) => {
                                                this._carousel = c;
                                            }}
                                            data={imgsSrc}
                                            renderItem={this._renderCarouselItem}
                                            sliderWidth={viewportWidth}
                                            itemWidth={viewportWidth}
                                            slideStyle={{width: viewportWidth}}
                                        />
                                        :
                                        <Image style={style.img} source={{uri: featureImg}}/>
                                }
                            </View>
                            <View style={style.flexRow}>
                                <View style={[style.priceWrap, {backgroundColor: _this.state.mainColor}]}><Text style={style.price}>{price}</Text></View>
                                <View style={style.titleOneWrap}>
                                    <Text style={style.subTitle} numberOfLines={1}>{subtitle}</Text>
                                    <Text style={style.title} numberOfLines={1}>{title}</Text>
                                </View>
                                <View style={style.infoOneWrap}>
                                    <View style={style.icoStyle}>
                                        <Ico icoColor={GLOBAL.COLOR.gray88} icoSize={12} icoName='camera'/>
                                    </View>
                                    <View>
                                        <Text style={style.infoDataTopWrap} numberOfLines={1}>{imgsNum}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
        }
    }
}

const style = EStyleSheet.create({
    wrapper: {
        position: 'relative',
        marginBottom: '20rem',
        overflow: 'hidden'
    },

    img: {
        width: '100%',
        height: '200rem',
        resizeMode: 'cover',
        flex: 1
    },

    slide: {
        width: '100%',
        height: '200rem',
        flex: 1,
    },

    flexRow: {
        flex: 1,
        height: '45rem',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#eae9e9',
        opacity: 0.9,
        paddingRight: 4
    },

    priceWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
        height: '100%',
    },

    price: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18rem',
        fontWeight: '700',
        color: GLOBAL.COLOR.white
    },

    titleOneWrap: {
        width: '55%',
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '5rem',
        paddingRight: '5rem',
    },

    titleTwoWrap: {
        width: '37%',
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '5rem',
        paddingRight: '5rem',
    },

    subTitle: {
        fontSize: '13rem',
        color: GLOBAL.COLOR.gray88,
        fontWeight: '500'
    },

    title: {
        fontSize: '14rem',
        color: GLOBAL.COLOR.title,
        fontWeight: '700'
    },

    infoOneWrap: {
        width: '15%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5rem',
    },

    infoTwoWrap: {
        width: '33%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5rem',
    },

    infoTwoAbsoluteWrap: {
        width: '10%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 13,
        right: 10,
        backgroundColor: GLOBAL.COLOR.title,
        opacity: 0.9,
        paddingTop: 1,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 3,
        borderRadius: 2
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
    }
});

export default GridViewItemComponent;