import React from 'react';
import {
    ScrollView,
    Dimensions,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import EStyleSheet from 'react-native-extended-stylesheet';
import {doRegistration} from "../helpers/MotorsRestApi"
import GLOBALS from '../constants/globals';
import Ico from '../components/Ico';
import AppBottomNavigation from '../components/AppBottomNavigation'
import Toast, {DURATION} from 'react-native-easy-toast'
import _ from 'lodash';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let registerData = {};

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            loading: false,
            hidePass: true,
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
            headerTitle: <View style={styles.appMainTitle}>
                <Text style={styles.center}><Translation str='registration'/></Text>
            </View>,
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

    _doRegister = () => {
        if (Object.keys(registerData).length > 0) {
            _this.setState({
                loading: true
            })

            const formData = new FormData();

            _.map(registerData, function (data, index) {
                if(index == 'avatar') {
                    formData.append(index, data[0]['base64'])
                } else {
                    formData.append(index, data)
                }
            })

            doRegistration(formData).then((responseJson) => {
                if (responseJson.code == 200) {
                    _this._showToast(responseJson.message);

                    AsyncStorage.setItem('userData', JSON.stringify(responseJson.user), () => {
                    });

                    _this.props.navigation.navigate('Profile')
                } else {
                    _this._showToast(responseJson.message);
                }

                _this.setState({
                    loading: false
                })
            })
        } else {

        }
    }

    _setSelectedImage = (img) => {
        registerData['avatar'] = img;

        _this.setState({
            update: (_this.state.update) ? false: true
        })
    }

    _showToast = (text, color) => {
        _this.refs['toast'].show(text, 3000);
    }

    _showPass = () => {
        _this.setState({
            hidePass: (_this.state.hidePass) ? false : true
        })
    }

    render() {
        return (
            <KeyboardAvoidingView behavior={"padding"} style={{flex:1}}>
                <ScrollView>
                    <View style={styles.mainWrap}>
                        <View style={styles.registerWrap}>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='login'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               registerData['stm_nickname'] = text
                                           }}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='first_name'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               registerData['stm_user_first_name'] = text
                                           }}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='last_name'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               registerData['stm_user_last_name'] = text
                                           }}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='phone'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               registerData['stm_user_phone'] = text
                                           }}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='email'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               registerData['stm_user_mail'] = text
                                           }}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='password'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           secureTextEntry={_this.state.hidePass} textContentType='password'
                                           onChangeText={(text) => {
                                               registerData['stm_user_password'] = text;
                                           }}/>
                                <TouchableOpacity
                                    activeOpacity={0.8} style={styles.inputIco} onPress={() => {
                                    _this._showPass()
                                }}>
                                    {
                                        _this.state.hidePass
                                        ?
                                            <Ico icoName='eye' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                                        :
                                            <Ico icoName='eye-crossed' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                                    }

                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='avatar'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.inputAvatar}
                                           editable={false}
                                           value={(typeof (registerData['avatar']) != 'undefined') ? registerData['avatar'][0]['src'] : ''}/>
                                <TouchableOpacity
                                    activeOpacity={0.8} style={styles.inputIco} onPress={() => {
                                    _this.props.navigation.navigate('ChooseImage', {_setSelectedImage: _this._setSelectedImage})
                                }}>
                                    <Ico icoName='camera1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.btn}>
                                {
                                    _this.state.loading
                                        ?
                                        <View style={styles.indicator}>
                                            <ActivityIndicator size='small' color={_this.state.secondColor}/>
                                        </View>
                                        :
                                        <TouchableOpacity
                                            activeOpacity={0.8} style={[styles.btn_l, {backgroundColor: _this.state.mainColor}]} onPress={() => {
                                            _this._doRegister();
                                        }
                                        }>
                                            <Text style={styles.btnText}><Translation str='sign_up'/></Text>
                                        </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <AppBottomNavigation navigation={this.props.navigation} activeTab='lnr-user'/>
                <Toast ref="toast" positionValue={180}/>
            </KeyboardAvoidingView>
        );
    }
}

const styles = EStyleSheet.create({

    mainWrap: {
        flex: 1,
        position: 'relative',
        height: '100%',
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
    },

    invisibleBlock: {
        width: '30rem'
    },

    svgStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '33rem',
        height: '33rem',
        borderColor: GLOBALS.COLOR.gray88,
        borderRadius: 50,
        borderWidth: 1,
        marginLeft: '10rem',
        marginRight: '10rem'
    },

    center: {
        textAlign: 'center'
    },

    registerWrap: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: '100%',
        paddingTop: '10rem',
        paddingBottom: '10rem',
    },

    inputWrap: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        paddingTop: '10rem',
        paddingBottom: '10rem',
        borderBottomWidth: 1,
        borderColor: GLOBALS.COLOR.hr,
        borderStyle: 'solid'
    },

    label: {
        width: '30%',
        fontSize: '14rem',
        fontWeight: '600',
        color: GLOBALS.COLOR.title,
    },

    input: {
        width: '70%',
        height: '40rem',
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '5rem',
        paddingLeft: '10rem',
        paddingRight: '10rem'
    },

    inputAvatar: {
        width: '70%',
        height: '40rem',
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '5rem',
        paddingLeft: '10rem',
        paddingRight: '35rem'
    },

    btn: {
        width: '100%',
        marginTop: '30rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    btn_l: {
        width: '100%',
        height: '55rem',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '30rem',
    },

    btnText: {
        color: GLOBALS.COLOR.white,
        fontSize: '15rem',
        fontWeight: '600'
    },

    inputIco: {
        position: 'absolute',
        right: '25rem',
        padding: '10rem'
    },

    singUp: {
        width: '100%',
        height: '55rem',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '30rem',
        borderWidth: 1,
        borderColor: GLOBALS.COLOR.white,
        borderStyle: 'solid',
        marginTop: '15rem'
    },

    indicator: {
        width: '100%',
        height: '55rem',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
})