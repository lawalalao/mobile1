import React from 'react';
import {Text, View, Button, TouchableOpacity, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import Menu, {MenuItem, MenuDivider, Position} from 'react-native-enhanced-popup-menu';
import GLOBALS from "../constants/globals";
import Ico from '../components/Ico';
import ProfileEdit from "../screens/ProfileEdit";
import EStyleSheet from "react-native-extended-stylesheet";

const entireScreenWidth = Dimensions.get('window').width;
const entireScreenHeight = Dimensions.get('window').height;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;

class ProfileMenu extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        this.state = {
            currPage: '',
            activeBtn: false,
            mainColor: '#1bc744',
            secondColor: '#2d60f3'
        }
    }

    _logOut = async () => {
        try {
            await AsyncStorage.removeItem('userData');
            this.props.navigation.replace('Home');
        } catch (error) {
            console.log(error.message);
        }
    }

    async componentWillMount() {
        try {
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');

            _this.setState({
                mainColor: (mc != '') ? mc : '#1bc744',
                secondColor: (sc != '') ? sc : "#2d60f3",
                currPage: this.props.currentPage.curPage
            })
        } catch (e) {
            this.setState({
                currPage: this.props.currentPage.curPage
            })
            console.log("error from AsyncStorage Add A Car One 2: ", e);
        }


    }

    render() {
        let textRef = React.createRef();
        let menuRef = null;

        let _props = this.props.navigation;


        const setMenuRef = ref => menuRef = ref;
        const hideMenu = () => menuRef.hide();
        const showMenu = () => menuRef.show(textRef.current, stickTo = Position.BOTTOM_LEFT, {left: 15, top: 30});
        const onPress = () => {
            _this.setState({activeBtn: true});
            showMenu();
        };
        const onHdn = () => {
            _this.setState({activeBtn: false});
        }

        return (
            <TouchableOpacity
                activeOpacity={0.8} style={[styles.svgStyle, _this.state.activeBtn ? {backgroundColor: _this.state.secondColor, borderColor: _this.state.secondColor} : '']} onPress={onPress}>
            <View style={{alignItems: "center"}}>
                <Text ref={textRef} style={{fontSize: 0, width: 0, height: 0}}></Text>
                <Ico icoName='lnr-menu' icoColor={_this.state.activeBtn ? GLOBALS.COLOR.white : GLOBALS.COLOR.gray88} icoSize={16}/>
                <Menu style={[styles.menuSt, {backgroundColor: _this.state.secondColor}]} ref={setMenuRef} onHidden={onHdn}>
                    <MenuItem textStyle={{color: GLOBALS.COLOR.white}} onPress={() => {
                        hideMenu()
                        this.props.navigation.navigate('Profile');
                    }} disabled={this.state.currPage == 'profile' ? true : false}><Translation str='my_account'/></MenuItem>
                    <MenuItem textStyle={{color: GLOBALS.COLOR.white}} onPress={() => {
                        hideMenu()
                        this.props.navigation.navigate('ProfileEdit');
                    }} disabled={this.state.currPage == 'edit_profile' ? true : false}><Translation str='edit_account'/></MenuItem>
                    <MenuItem textStyle={{color: GLOBALS.COLOR.white}} onPress={() => {
                        hideMenu()
                        this._logOut();
                    }}><Translation str='log_out'/></MenuItem>
                </Menu>
            </View>
            </TouchableOpacity>
        );
    }
};

const styles = EStyleSheet.create({
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

    menuSt: {
        borderWidth: 0,
        minWidth: '200rem'
    }
})

export default ProfileMenu;