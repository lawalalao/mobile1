import React from 'react';
import {
    View,
    Dimensions,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import {updateProfile} from "../helpers/MotorsRestApi";
import ProfileMenu from '../components/ProfileMenu';
import Toast, {DURATION} from 'react-native-easy-toast'
import _ from 'lodash';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let profileData = {};

export default class ProfileEdit extends React.Component {
    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            update: false,
            loading: false,
            hidePass: true,
            userData: {},
            userId: '',
            userToken: '',
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
            
            let user = await AsyncStorage.getItem('userData');
            user = JSON.parse(user);

            if(Object.keys(user).length > 0) {
                this.setState({userData: user, userId: user.ID, userToken: user.token});
                profileData['stm_user_first_name'] = user.f_name;
                profileData['stm_user_last_name'] = user.l_name;
                profileData['stm_user_phone'] = user.phone;
                profileData['stm_user_mail'] = user.user_email;
            }
            _this.setState({
                loading: false
            })

        } catch (e) {
            console.log("error from AsyncStorage Profile Edit: ", e);
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
                    <Text style={styles.center}><Translation str='edit_profile'/></Text>
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
            headerRight: (
                <View style={styles.svgStyle}>
                    <ProfileMenu navigation={navigation} currentPage={{curPage: 'edit_profile'}}/>
                </View>),
        }
    };

    _changeText = (field, text) => {
        profileData[field] = text
    }

    _updateProfile = () => {

        if (Object.keys(profileData).length > 0) {
            _this.setState({
                loading: true
            })

            const formData = new FormData();

            formData.append('userId', _this.state.userId);
            formData.append('userToken', _this.state.userToken);

            _.map(profileData, function (data, index) {
                if(index == 'avatar') {
                    formData.append(index, data[0]['base64'])
                } else {
                    formData.append(index, data)
                }
            })

            updateProfile(formData).then((responseJson) => {

                if (responseJson.code == 200) {
                    _this._showToast(responseJson.message);

                    //AsyncStorage.setItem('userData', JSON.stringify(responseJson.user), () => {});
                    //_this.props.navigation.navigate('Profile')
                } else {
                    _this._showToast(responseJson.message);
                }

                _this.setState({
                    loading: false
                })
            })
        } else {
            _this._showToast('Please Fill Required Fields', '')
        }
    }

    _setSelectedImage = (img) => {
        profileData['avatar'] = img;

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
            <KeyboardAvoidingView behavior={"padding"} style={{flex: 1, width: '100%'}}>
                <ScrollView>
                    <View style={styles.mainWrap}>
                        <View style={styles.registerWrap}>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='login'/></Text>
                                <TextInput underlineColorAndroid='transparent' value={_this.state.userData.user_login}
                                           editable={false} style={styles.input}/>
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='first_name'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               _this._changeText('stm_user_first_name', text);
                                           }}
                                           placeholder={profileData['stm_user_first_name']}
                                />
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='last_name'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               _this._changeText('stm_user_last_name', text);
                                           }}
                                           placeholder={profileData['stm_user_last_name']}
                                />
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='phone'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               _this._changeText('stm_user_phone', text);
                                           }}
                                           placeholder={profileData['stm_user_phone']}
                                />
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='email'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           onChangeText={(text) => {
                                               _this._changeText('stm_user_mail', text);
                                           }}
                                           placeholder={profileData['stm_user_mail']}
                                />
                            </View>
                            <View style={styles.inputWrap}>
                                <Text style={styles.label}><Translation str='password'/></Text>
                                <TextInput underlineColorAndroid='transparent' style={styles.input}
                                           secureTextEntry={_this.state.hidePass}
                                           textContentType='password'
                                           needsOffscreenAlphaCompositing={true}
                                           onChangeText={(text) => {
                                               profileData['stm_user_password'] = text;
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
                                           value={(typeof (profileData['avatar']) != 'undefined') ? profileData['avatar'][0]['src'] : ''}/>
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
                                            _this._updateProfile();
                                        }}>
                                            <Text style={styles.btnText}><Translation str='update'/></Text>
                                        </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <Toast ref="toast" positionValue={180}/>
            </KeyboardAvoidingView>
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

    mainTitle: {
        fontSize: '14rem',
        fontWeight: '700',
        paddingTop: '20rem',
        paddingBottom: '20rem',
        marginBottom: '20rem',
        color: GLOBALS.COLOR.title,
        borderBottomColor: GLOBALS.COLOR.gray88,
        borderBottomWidth: '1rem',
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
});