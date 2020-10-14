import { Dimensions, Platform, PixelRatio } from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import _ from 'lodash';

const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 414;

export function normalize(size) {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize))
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    }
}

export function Capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function removeFromObject (ID, obj) {
    let newObj = [];
    _.map(obj, function (val, index) {
        if (val.ID != ID) {
            newObj.push(val);
        }
    });

    return newObj;
}