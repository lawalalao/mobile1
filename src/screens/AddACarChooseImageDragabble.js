import React from 'react';
import {
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    Image,
} from 'react-native';

import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import SortableListView from 'react-native-sortable-listview'

import ImagePicker from 'react-native-image-picker';

import _ from 'lodash';
import AsyncStorage from "@react-native-community/async-storage";
import Translation from '../helpers/Translation';

const options = {
    title: 'Choose Image',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
    quality: 0.7,
    mediaType: 'photo'
};

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;

let order = [];

class RowComponent extends React.Component {

    render() {
        return (
            <TouchableHighlight
                underlayColor={'#eee'}
                style={{marginTop: 8, marginBottom: 8}}
                {...this.props.sortHandlers}
                onPress={() => {
                    _this._updateView(this.props.data.position)
                }}
            >
                {
                    parseInt(this.props.data.position) === parseInt(_this.state.selected)
                        ?
                        <View style={[styles.imgWrapBorder, {borderColor: _this.state.mainColor}]}>
                            <Image
                                source={{uri: (this.props.data.src) ? `data:image/jpg;base64,${this.props.data.src}` : this.props.data.src}}
                                style={[styles.img, {opacity: 0.6}]}/>
                            <View style={styles.removeImage}>
                                <TouchableOpacity
                                    activeOpacity={0.8} onPress={() => {
                                    _this._removePhoto(this.props.data.position);
                                }}>
                                    <Ico icoName='remove1' icoSize={16} icoColor={GLOBALS.COLOR.white}/>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.moveIco}>
                                <Ico icoName='move' icoSize={60} icoColor={GLOBALS.COLOR.white} />
                            </View>
                        </View>
                        :
                        <View style={styles.imgWrap}>
                            <Image
                                source={{uri: (this.props.data.src) ? `data:image/jpg;base64,${this.props.data.src}` : this.props.data.url}}
                                style={styles.img}/>
                        </View>
                }
            </TouchableHighlight>
        )
    }
}

export default class AddACarChooseImageDragabble extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            isLoading: true,
            images: {},
            selected: '',
            mainColor: '',
            secondColor: ''
        }
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            headerStyle: {
                height: 50,
                backgroundColor: GLOBALS.COLOR.title,
                borderBottomWidth: 0,
            },
            headerTitle: (
                <View style={styles.appMainTitle}>
                    <Text style={styles.center}><Translation str='choose_image'/></Text>
                </View>
            ),
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        navigation.goBack()
                    }}>
                        <Ico icoName='lnr-cross' icoColor={GLOBALS.COLOR.white} icoSize={14}/>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: (<View style={styles.invisibleBlock}></View>)
        }
    };

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

        if (_this.props.navigation.state.params.addACarParams.hasOwnProperty('images')) {
            order = Object.keys(_this.props.navigation.state.params.addACarParams.images);

            _this.setState({
                images: _this.props.navigation.state.params.addACarParams.images
            })
        }
    }

    _btnOnPress = () => {
        _this.props.navigation.goBack();
    }

    _btnChoosePhoto = async () => {

        ImagePicker.launchImageLibrary(options, (response) => {

            let imgs = _this.state.images;

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                let pos = Object.keys(imgs).length;

                imgs[pos] = {key: `item-${pos}`, 'src': response.data, 'position': pos};

                order = Object.keys(imgs);

                this.setState({images: imgs});

                _this.props.navigation.state.params._setFilterSelectParams('images', imgs);
            }
        });
    };

    _btnOpenCamera = async () => {

        ImagePicker.launchCamera(options, (response) => {
            let imgs = _this.state.images;

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                let pos = Object.keys(imgs).length;

                imgs[pos] = {key: `item-${pos}`, 'src': response.data, 'position': pos};

                order = Object.keys(imgs);

                this.setState({images: imgs});

                _this.props.navigation.state.params._setFilterSelectParams('images', imgs);
            }
        });
    }

    _removePhoto = (position) => {
        let newImgs = {};
        let i = 0;

        _.map(_this.state.images, function (data, index) {
            if(index != position) {
                data.position = i;
                data.key = "item-" + i,
                newImgs[i] = data;
                i += 1;
            }
        })

        order = Object.keys(newImgs);

        _this.setState({
            images: newImgs
        })

        _this.props.navigation.state.params._setFilterSelectParams('images', newImgs);
    }

    _updateView = (position) => {
        _this.setState({
            selected: (position === _this.state.selected) ? '' : position
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.photoListWrap}>
                    {
                        (Object.keys(_this.state.images).length > 0)
                            ?
                            <View style={{flex: 1}}>
                                <SortableListView
                                    data={_this.state.images}
                                    order={order}
                                    onRowMoved={e => {
                                        order.splice(e.to, 0, order.splice(e.from, 1)[0])
                                        let newImgs = {};
                                        let newIndex = 0;

                                        order.forEach(function (i) {
                                            let imgObj = _this.state.images[i];
                                            imgObj.position = newIndex;
                                            imgObj.active = 'no';
                                            newImgs[newIndex] = imgObj;
                                            newIndex += 1;
                                        })

                                        _this.setState({
                                            images: newImgs,
                                            selected: ''
                                        })

                                        _this.props.navigation.state.params._setFilterSelectParams('images', newImgs);

                                        order = Object.keys(newImgs);
                                    }}
                                    renderRow={row => <RowComponent data={row}/>}
                                    rowHasChanged={(e) => {
                                        return true;
                                    }}
                                />
                            </View>
                            :
                            <View>
                                <TouchableOpacity
                                    activeOpacity={0.8} style={styles.emptyImg} onPress={() => {
                                    _this._btnChoosePhoto()
                                }}>
                                    <View style={styles.whiteOverlay}></View>
                                    <Ico icoName='lnr-plus-circle' icoColor={GLOBALS.COLOR.white} icoSize={44}/>
                                </TouchableOpacity>
                            </View>
                    }
                </View>
                <View style={styles.btnsWrap}>
                    <View style={styles.horizontalBtns}>
                        <View style={styles.btnHWrap}>
                            <TouchableOpacity
                                activeOpacity={0.8} style={[styles.chooseButton, {backgroundColor: _this.state.secondColor}]} onPress={() => {
                                _this._btnChoosePhoto()
                            }}>
                                <Text style={styles.btnText}><Translation str='choose_photo'/></Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.btnHWrap}>
                            <TouchableOpacity
                                activeOpacity={0.8} style={[styles.chooseButton, {backgroundColor: _this.state.secondColor}]} onPress={() => {
                                _this._btnOpenCamera()
                            }}>
                                <Text style={styles.btnText}><Translation str='open_camera'/></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.btnWrap}>
                        <TouchableOpacity
                            activeOpacity={0.8} style={[styles.saveButton, {backgroundColor: _this.state.mainColor}]} onPress={() => {
                            _this._btnOnPress()
                        }}>
                            <Text style={styles.btnText}><Translation str='save'/></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        height: '100%',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        backgroundColor: GLOBALS.COLOR.title
    },

    content: {
        position: 'absolute',
        top: 50,
        left: 50
    },

    invisibleBlock: {
        width: '30rem'
    },

    svgStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34rem',
        height: '34rem',
        borderColor: GLOBALS.COLOR.white,
        borderRadius: 34,
        borderWidth: 1,
        marginLeft: '10rem',
        marginRight: '10rem'
    },

    emptyImg: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '200rem',
        borderRadius: '5rem',
        overflow: 'hidden',
    },

    whiteOverlay: {
        width: '100%',
        height: '200rem',
        backgroundColor: GLOBALS.COLOR.white,
        opacity: 0.1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center',
    },

    center: {
        textAlign: 'center',
        color: GLOBALS.COLOR.white,
        fontWeight: '600'
    },

    photoListWrap: {
        flex: 1,
        height: '100%',
        paddingTop: '10rem',
        paddingBottom: '10rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    imgWrap: {
        borderWidth: 2,
        borderColor: GLOBALS.COLOR.title,
        borderStyle: 'solid',
    },

    imgWrapBorder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        position: 'relative'
    },

    removeImage: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30rem',
        height: '30rem',
        backgroundColor: GLOBALS.COLOR.red,
        borderRadius: 8,
        position: 'absolute',
        top: 8,
        right: 8
    },

    moveIco: {
        width: '60rem',
        height: '60rem',
        position: 'absolute'
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

    saveButton: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '8rem'
    },

    chooseButton: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '8rem'
    },

    btnsWrap: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: '100%',
    },

    btnHWrap: {
        width: '48%',
        paddingTop: '5rem',
        paddingBottom: '5rem',
    },

    horizontalBtns: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    btnText: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '700',
    },

    btnWrap: {
        paddingTop: '5rem',
        paddingBottom: '5rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
});