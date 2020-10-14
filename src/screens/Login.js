import React from 'react';
import {
    ScrollView,
    Dimensions,
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';
import {doLogin} from "../helpers/MotorsRestApi"
import GLOBALS from '../constants/globals';
import Ico from '../components/Ico';
import AppBottomNavigation from '../components/AppBottomNavigation'
import Toast, {DURATION} from 'react-native-easy-toast'
import _ from 'lodash';
import Translation from '../helpers/Translation';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let loginData = {};

const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login' })],
});

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            loginVisible: true,
            title: 'Login',
            loading: false,
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
            headerTitle: <View style={{flex: 1, justifyContent: 'center'}}>
                <Image style={{width: 'auto', height: 24, resizeMode: 'contain'}}
                       source={require('../assets/img/logo-dark.png')}/>
            </View>,
            headerLeft: (<View style={styles.invisibleBlock}></View>),
            headerRight: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        navigation.goBack()
                    }}>
                        <Ico icoName='lnr-cross' icoColor={GLOBALS.COLOR.gray88} icoSize={14}/>
                    </TouchableOpacity>
                </View>
            )

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

    _doLogin = () => {
        if (Object.keys(loginData).length > 0) {
            _this.setState({
                loading: true
            })

            const formData = new FormData();

            _.map(loginData, function (data, index) {
                formData.append(index, data)
            })

            doLogin(formData).then((responseJson) => {
                if (responseJson.code == 200) {
                    _this._showToast(responseJson.message);

                    _this.props.navigation.dispatch(resetAction);

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
                .catch((error) => {
                    _this._showToast(error.message);
                })

        } else {
            _this._showToast('Please Fill Required Fields', '');
        }
    }

    _showToast = (text, color) => {
        _this.refs['toast'].show(text, 3000);
    }

    render() {
        return (
            <ImageBackground source={require('../assets/img/login_bg.jpg')} style={{width: '100%', height: '100%'}}>
                <ScrollView>
                    <View style={styles.mainWrap}>
                        <View style={styles.loginWrap}>
                            <View style={styles.inputWrap}>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           placeholder='Login' onChangeText={(text) => {
                                    loginData['stm_login'] = text;
                                }}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           placeholder='Password' secureTextEntry={true} textContentType='password'
                                           onChangeText={(text) => {
                                               loginData['stm_pass'] = text;
                                           }}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <View style={styles.btn}>
                                    {
                                        _this.state.loading
                                            ?
                                            <View style={styles.indicator}>
                                                <ActivityIndicator size='small' color={_this.state.secondColor}/>
                                            </View>
                                            :
                                            <TouchableOpacity
                                                activeOpacity={0.8} style={[styles.btn_l, {backgroundColor: _this.state.secondColor}]} onPress={() => {
                                                _this._doLogin();
                                            }
                                            }>
                                                <Text style={styles.btnText}><Translation str='sign_in' /></Text>
                                            </TouchableOpacity>
                                    }
                                </View>
                                <View style={styles.orWrap}>
                                    <View style={styles.divider}></View>
                                    <Text style={styles.or}><Translation str='or'/></Text>
                                    <View style={styles.divider}></View>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        activeOpacity={0.8} style={styles.singUp} onPress={() => {
                                        _this.props.navigation.navigate('Register')
                                    }
                                    }>
                                        <Text style={styles.btnText}><Translation str='sign_up'/></Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.termPrivacy}>
                                    <Text style={styles.termPrivacyText}><Translation str='by_creating'/> <Text style={styles.termPrivacyTextLink} onPress={() => { console.log(1); }}><Translation str='terms_conditions'/></Text> <Translation str='and'/> <Text style={styles.termPrivacyTextLink} onPress={() => { console.log(1); }}> <Translation str='privacy_statement'/></Text></Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <Toast ref="toast" positionValue={180}/>
                <AppBottomNavigation navigation={this.props.navigation} activeTab='lnr-user'/>
            </ImageBackground>
        );
    }
}

const styles = EStyleSheet.create({
    mainWrap: {
        flex: 1,
        position: 'relative',
        height: '100%',
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

    loginWrap: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20rem',
        marginTop: 50
    },

    inputWrap: {
        width: '100%',
        marginBottom: '15rem'
    },

    input: {
        width: '100%',
        height: '55rem',
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        backgroundColor: GLOBALS.COLOR.white,
        borderRadius: '30rem',
        textAlign: 'center'
    },

    btn: {
        marginBottom: '30rem'
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

    orWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '40rem'
    },

    divider: {
        width: '30rem',
        borderTopWidth: 1,
        borderColor: GLOBALS.COLOR.white,
        borderStyle: 'solid'
    },

    or: {
        fontSize: '15rem',
        fontWeight: '600',
        color: GLOBALS.COLOR.white,
        marginLeft: '15rem',
        marginRight: '15rem'
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

    termPrivacy: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 30
    },

    termPrivacyText: {
        fontSize: '13rem',
        fontWeight: '400',
        color: GLOBALS.COLOR.white,
        textAlign: 'center',
        lineHeight: '20rem'
    },

    termPrivacyTextLink: {
        fontSize: '13rem',
        fontWeight: '400',
        color: GLOBALS.COLOR.white,
        textDecorationLine: 'underline',
        textDecorationColor: GLOBALS.COLOR.white,
        textDecorationStyle: 'solid'
    },
})