import React from 'react';
import {
    ScrollView,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';


import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import ImagePicker from 'react-native-image-picker';
import _ from 'lodash';
import AsyncStorage from "@react-native-community/async-storage";
import Translation from '../helpers/Translation';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;

const options = {
    title: 'Select Avatar',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
    quality: 0.7,
    mediaType: 'photo'
};

export default class ChooseImage extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            isLoading: true,
            images: {},
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
                    <Text style={styles.center}><Translation str='choose_image'/> </Text>
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
            headerRight: (<View style={styles.invisibleBlock}></View>),
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
    }

    componentDidUpdate() {
    }

    _btnOnPress = () => {
        _this.props.navigation.goBack();
    }

    _btnChoosePhoto = async () => {

        ImagePicker.launchImageLibrary(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                let imgs = _this.state.images;

                imgs[0] = {'src': response.uri, 'base64': response.data};
                this.setState({images: imgs});
                _this.props.navigation.state.params._setSelectedImage(imgs);
            }
        });

    };

    _btnOpenCamera = async () => {
        ImagePicker.launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                let imgs = _this.state.images;

                imgs[0] = {'src': response.uri, 'base64': response.data};
                this.setState({images: imgs});
                _this.props.navigation.state.params._setSelectedImage(imgs);
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView style={styles.photoListWrap}>
                    {
                        (Object.keys(_this.state.images).length > 0)
                            ?
                            _.map(_this.state.images, function (data, index) {
                                return (
                                    <View style={styles.imgWrap} key={index}>
                                        <Image source={{uri: data.src}} style={styles.img}/>
                                    </View>
                                )
                            })

                            :
                            <View>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.emptyImg}
                                    onPress={() => {
                                        _this._btnChoosePhoto()
                                    }}>
                                    <View style={styles.whiteOverlay}></View>
                                    <Ico icoName='lnr-plus-circle' icoColor={GLOBALS.COLOR.white} icoSize={44}/>
                                </TouchableOpacity>
                            </View>
                    }
                </ScrollView>
                <View style={styles.btnsWrap}>
                    <View style={styles.horizontalBtns}>
                        <View style={styles.btnHWrap}>
                            <TouchableOpacity
                                activeOpacity={0.8} style={[styles.chooseButton, {backgroundColor: _this.state.secondColor}]}
                                              onPress={() => {
                                                  _this._btnChoosePhoto()
                                              }}>
                                <Text style={styles.btnText}><Translation str='choose_photo'/></Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.btnHWrap}>
                            <TouchableOpacity
                                activeOpacity={0.8} style={[styles.chooseButton, {backgroundColor: _this.state.secondColor}]}
                                              onPress={() => {
                                                  _this._btnOpenCamera()
                                              }}>
                                <Text style={styles.btnText}><Translation str='open_camera'/></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.btnWrap}>
                        <TouchableOpacity
                            activeOpacity={0.8} style={[styles.saveButton, {backgroundColor: _this.state.mainColor}]}
                                          onPress={() => {
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
        backgroundColor: '#fff',
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
        opacity: 0.3,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
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
        marginTop: '5rem',
        marginBottom: '5rem'
    },

    img: {
        width: '100%',
        height: '400rem',
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