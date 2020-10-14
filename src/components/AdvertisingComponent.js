import React from 'react';
import { View, Platform } from 'react-native';
import firebase from 'react-native-firebase';
import AsyncStorage from "@react-native-community/async-storage";
import _ from 'lodash';

let _this;
let adsSettings = {};

export default class AdvertisingComponent extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        this.state = {
            refresh: false,
            adBannerShow: true
        }
    }

    async componentWillMount() {

        console.log('AdsConsole will mount');

        try {
            let settings = await AsyncStorage.getItem('ads_settings');
            adsSettings = JSON.parse(settings);

            console.log('AdsConsole will mount' + adsSettings);

            if(_this._getAdSettingParam('show_ads') == 'yes' && _this._getAdSettingParam('ad_type') == 'interstitial') _this._showInterstitial();

            _this.setState({
                refresh: true
            })
        } catch (e) {
            console.log("error from AsyncStorage Colors: ", e);
        }
    }

    componentDidMount() {}

    componentWillUpdate() {
        console.log('Ad banner show', _this.state.adBannerShow);
    }

    componentWillUnmount() {
    }

    _showInterstitial = () => {

        console.log('AdsConsole Interstitial');

        const adUnitId = Platform.OS === 'ios' ? _this._getAdSettingParam('ios_interstitial_id').replace('\\\\', '') : _this._getAdSettingParam('android_interstitial_id').replace('\\\\', '');
        const firstTime = (_this._getAdSettingParam('ad_first_time') != '') ? parseInt(_this._getAdSettingParam('ad_first_time')) * 1000 : null;
        const nextTime = (_this._getAdSettingParam('ad_interval') != '') ? parseInt(_this._getAdSettingParam('ad_interval')) * 1000 : null;

        if(firstTime != null) {
            const advert = firebase.admob().interstitial(adUnitId);

            const AdRequest = firebase.admob.AdRequest;
            const request = new AdRequest();

            advert.loadAd(request.build());

            advert.on('onAdLoaded', () => {
                console.log('Advert - ', 'Advert ready to show.');
            });

            advert.on('onAdLeftApplication', () => {
                console.log('Advert - ', 'Advert open and left.');
                _this.setState({
                    refresh: true
                })
            });

            advert.on('onAdClosed', () => {
                console.log('Advert - ', 'Advert closed.');
                if (nextTime != null) {
                    setTimeout(() => {
                        _this._showInterstitial();
                    }, nextTime)
                }
            });

            setTimeout(() => {
                if (advert.isLoaded()) {
                    console.log('Advert - ', 'Advert show');
                    advert.show();
                } else {
                    console.log('Advert - ', 'Unable to show interstitial - not loaded yet.');
                    _this._showInterstitial();
                    // Unable to show interstitial - not loaded yet.
                }
            }, firstTime);
        }
    }

    _getAdSettingParam = (param) => {
        return (adsSettings.hasOwnProperty(param)) ? _.get(adsSettings, param) : '';
    }

    render() {
        console.log('AdsConsole render');
        if(_this._getAdSettingParam('show_ads') == 'yes' && _this._getAdSettingParam('ad_type') == 'banner' && _this.state.adBannerShow) {
            const Banner = firebase.admob.Banner;
            const AdRequest = firebase.admob.AdRequest;
            const request = new AdRequest();

            const adUnitId = Platform.OS === 'ios' ? _this._getAdSettingParam('ios_banner_id').replace('\\\\', '') : _this._getAdSettingParam('android_banner_id').replace('\\\\', '');

            return (
                <View>
                    <Banner
                        unitId={adUnitId}
                        size={'SMART_BANNER'}
                        request={request.build()}
                        onAdLoaded={() => {
                            console.log('Advert loaded');
                        }}
                        onAdClosed={() => {
                            console.log('Ad click close', _this.state.adBannerShow);
                            _this.setState({
                                adBannerShow: false
                            })
                        }}
                        onAdFailedToLoad={(err)=> {
                            console.log('Ad error - ', err);
                        }}
                    />
                </View>
            );
        }
        console.log("AdsConsole", _this._getAdSettingParam('show_ads'));
        return(
            <View></View>
        );
    }
}