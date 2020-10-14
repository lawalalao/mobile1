import React from "react";
import {
  Dimensions,
  Text,
  View,
  Image,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import EStyleSheet from "react-native-extended-stylesheet";
import AsyncStorage from "@react-native-community/async-storage";
import Translation from "./src/helpers/Translation";

import Main from "./src/screens/Main";
import Inventory from "./src/screens/Inventory";
import Details from "./src/screens/Details";
import AddACarStepOne from "./src/screens/AddACarStepOne";
import AddACarStepTwo from "./src/screens/AddACarStepTwo";
import AddACarStepThree from "./src/screens/AddACarStepThree";
import Filter from "./src/screens/Filter";
import Profile from "./src/screens/Profile";
import ProfileEdit from "./src/screens/ProfileEdit";
import DealerProfile from "./src/screens/DealerProfile";
import FilterMakeChoose from "./src/screens/FilterMakeChoose";
import FilterDefaultChoose from "./src/screens/FilterDefaultChoose";
import AddACarMakeChoose from "./src/screens/AddACarMakeChoose";
import AddACarDefaultChoose from "./src/screens/AddACarDefaultChoose";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";
import ChooseImage from "./src/screens/ChooseImage";
import AddACarChooseImageDragabble from "./src/screens/AddACarChooseImageDragabble";
import MakeAlert from "./src/screens/MakeAlert";

import { EventRegister } from "react-native-event-listeners";
import firebase, {
  RemoteMessage,
  Notification,
  NotificationOpen,
} from "react-native-firebase";

import { getSettings } from "./src/helpers/MotorsRestApi";

const entireScreenWidth = Dimensions.get("window").width;
EStyleSheet.build({ $rem: entireScreenWidth / 380 });
const fcmChannelID = "RapidpieceApp";
const firebase_server_key =
  "AAAAjge7Xy0:APA91bE4Q-_hC-m7fq34kgp7gdjfTVQvbyhY9lTvr1hBmkXfD4Xr2zbKDLP9mpQlGsyPJH46K41o2hvW7duYK7ylU0QmboVH97_apOOE3lxSeGhf7Hf5p4GloVRF0_OfIiwN0Nfmnsp3";

let _this;
let translateObj = null;

class App extends React.Component {
  constructor(props) {
    super(props);

    _this = this;

    this.state = {
      numOfListings: 0,
      redirect: false,
      refresh: false,
    };
  }

  async componentWillMount() {
    const channel = new firebase.notifications.Android.Channel(
      "test-channel",
      "Test Channel",
      firebase.notifications.Android.Importance.Max
    ).setDescription("My apps test channel");
    firebase.notifications().android.createChannel(channel);

    try {
      let deviceId = await AsyncStorage.getItem("device_id");
      let fcmToken = (await (firebase.messaging().getToken() != null))
        ? firebase.messaging().getToken()
        : null;

      if (deviceId == null) {
        console.log("FCM GET TOKEN: ", "DEVICE ID NULL");
        firebase
          .messaging()
          .hasPermission()
          .then((enabled) => {
            if (enabled) {
              this.notificationDisplayedListener();
              this.notificationListener();

              if (fcmToken) {
                AsyncStorage.setItem("device_id", fcmToken);
                firebase
                  .database()
                  .ref("/users/" + Math.floor(Math.random() * Math.floor(1000)))
                  .set({
                    notification_token: fcmToken,
                  })
                  .then((res) => {
                    console.log(res);
                  });
              } else {
                console.log("FCM TOKEN", "is null");
              }
            } else {
              console.log("Notification no permissions");
              firebase
                .messaging()
                .requestPermission()
                .then(() => {
                  console.log("Notification allow permissions");
                })
                .catch((error) => {
                  console.log("Notification deny permissions");
                });
            }
          });
      } else if (deviceId != null && deviceId != fcmToken) {
        console.log("FCM GET TOKEN: ", "DEVICE NOT EQUAL");
        AsyncStorage.setItem("device_id", fcmToken);

        this.notificationDisplayedListener();
        this.notificationListener();

        firebase
          .database()
          .ref("/users/" + Math.floor(Math.random() * Math.floor(1000)))
          .set({
            notification_token: fcmToken,
          })
          .then((res) => {
            console.log(res);
          });
      }
    } catch (e) {
      console.log("FCM GET TOKEN ERROR: ", e);
    }

    let acv = 1;

    try {
      acv = await AsyncStorage.getItem("acv");
      let translations = await AsyncStorage.getItem("translations");
      translateObj = translations;
    } catch (e) {
      console.log("error from AsyncStorage ACV: ", e);
    }

    await getSettings(acv)
      .then((responseJson) => {
        try {
          if (responseJson.hasOwnProperty("acv")) {
            AsyncStorage.setItem("acv", responseJson.acv, () => {});
          }

          if (responseJson.hasOwnProperty("app_type")) {
            AsyncStorage.setItem("app_type", responseJson.app_type, () => {});
          }

          if (responseJson.hasOwnProperty("main_color")) {
            AsyncStorage.setItem(
              "main_color",
              responseJson.main_color,
              () => {}
            );
          }

          if (responseJson.hasOwnProperty("secondary_color")) {
            AsyncStorage.setItem(
              "secondary_color",
              responseJson.secondary_color,
              () => {}
            );
          }

          if (responseJson.hasOwnProperty("grid_view_style")) {
            AsyncStorage.setItem(
              "gridViewStyle",
              responseJson.grid_view_style,
              () => {}
            );
          }

          if (responseJson.hasOwnProperty("inventory_view")) {
            AsyncStorage.setItem(
              "inventoryView",
              responseJson.inventory_view,
              () => {}
            );
          }

          if (responseJson.hasOwnProperty("api_key_android")) {
            AsyncStorage.setItem(
              "apiKeyAndroid",
              responseJson.api_key_android,
              () => {}
            );
          }

          if (responseJson.hasOwnProperty("api_key_ios")) {
            AsyncStorage.setItem(
              "apiKeyIos",
              responseJson.api_key_ios,
              () => {}
            );
          }

          if (responseJson.hasOwnProperty("currency")) {
            AsyncStorage.setItem("currency", responseJson.currency, () => {});
          }

          if (responseJson.hasOwnProperty("currency_name")) {
            AsyncStorage.setItem(
              "currency_name",
              responseJson.currency_name,
              () => {}
            );
          }

          if (responseJson.hasOwnProperty("translations")) {
            AsyncStorage.setItem(
              "translations",
              responseJson.translations,
              () => {
                translateObj = responseJson.translations;
                _this.setState({
                  refresh: true,
                });
              }
            );
          }

          if (responseJson.hasOwnProperty("ads_settings")) {
            AsyncStorage.setItem(
              "ads_settings",
              responseJson.ads_settings,
              () => {}
            );
          } else {
            AsyncStorage.removeItem("ads_settings", () => {});
          }
        } catch (e) {
          console.log("App js Asynch error", e);
        }

        if (responseJson.hasOwnProperty("num_of_listings")) {
          _this.setState({
            numOfListings: responseJson.num_of_listings,
            redirect: true,
          });
        }
      })
      .catch((error) => {
        console.log("App js ERROR", error);
      });
  }

  async componentDidMount() {
    this.notificationDisplayedListener = firebase
      .notifications()
      .onNotificationDisplayed((notification: Notification) => {
        // Process your notification as required
        // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
      });
    this.notificationListener = firebase
      .notifications()
      .onNotification((notification: Notification) => {
        // Process your notification as required
      });
  }

  render() {
    if (translateObj == null) {
      return (
        <ImageBackground
          source={require("./src/assets/img/launch_bg.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <View style={styles.imgWrap}>
              <Image
                style={{ width: "100%", height: "auto", resizeMode: "contain" }}
                source={require("./src/assets/img/logo-white.png")}
              />
            </View>
            <View>
              <ActivityIndicator style={{ marginBottom: 10 }} />
            </View>
          </View>
        </ImageBackground>
      );
    } else {
      EventRegister.emit("refreshTranslation", translateObj);

      if (this.state.redirect) {
        setTimeout(() => {
          _this.props.navigation.replace("Home");
        }, 1500);
      }

      return (
        <ImageBackground
          source={require("./src/assets/img/launch_bg.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <View style={styles.imgWrap}>
              <Image
                style={{ width: "100%", height: "auto", resizeMode: "contain" }}
                source={require("./src/assets/img/logo-white.png")}
              />
            </View>
            <View>
              {_this.state.numOfListings == 0 ? (
                <ActivityIndicator style={{ marginBottom: 10 }} />
              ) : (
                <Text style={styles.count}>{_this.state.numOfListings}</Text>
              )}
              <Text style={styles.text}>
                <Translation str="vehicle_for_sale" />
              </Text>
            </View>
          </View>
        </ImageBackground>
      );
    }
  }
}

const styles = EStyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: "140rem",
    paddingBottom: "115rem",
    paddingLeft: "80rem",
    paddingRight: "80rem",
  },

  content: {
    position: "absolute",
    top: 50,
    left: 50,
  },

  imgWrap: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    height: "30rem",
  },

  count: {
    fontSize: "35rem",
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },

  text: {
    fontSize: "14rem",
    fontWeight: "400",
    color: "#ffffff",
  },
});

const AppNavigator = createStackNavigator(
  {
    Launch: {
      screen: App,
      title: "Launch Page",
      navigationOptions: {
        header: null,
      },
    },
    Home: {
      screen: Main,
      title: "Main Page",
    },
    MakeAlert: {
      screen: MakeAlert,
      title: "Make Alert",
    },
    Inventory: {
      screen: Inventory,
      title: "Inventory Page",
    },
    AddACarStepOne: {
      screen: AddACarStepOne,
      title: "Add A Car",
    },
    AddACarStepTwo: {
      screen: AddACarStepTwo,
      title: "Add A Car",
    },
    AddACarStepThree: {
      screen: AddACarStepThree,
      title: "Add A Car",
    },
    Filter: {
      screen: Filter,
      title: "Filter",
    },
    FilterMakeChoose: {
      screen: FilterMakeChoose,
      title: "Choose Make",
    },
    FilterDefaultChoose: {
      screen: FilterDefaultChoose,
      title: "Choose Make",
    },
    AddACarMakeChoose: {
      screen: AddACarMakeChoose,
      title: "Choose Make",
    },
    AddACarDefaultChoose: {
      screen: AddACarDefaultChoose,
      title: "Choose Make",
    },
    ChooseImage: {
      screen: ChooseImage,
      title: "Choose Image",
    },
    AddACarChooseImageDragabble: {
      screen: AddACarChooseImageDragabble,
      title: "Choose Image",
    },
    Profile: {
      screen: Profile,
      title: "Profile",
    },
    ProfileEdit: {
      screen: ProfileEdit,
      title: "Edit Profile",
    },
    Details: {
      screen: Details,
      title: "Details Page",
    },
    DealerProfile: {
      screen: DealerProfile,
      title: "Dealer Profile",
    },
    Login: {
      screen: Login,
      title: "Login",
    },
    Register: {
      screen: Register,
      title: "Register",
    },
  },
  {
    initialRouteNema: "Launch",
  }
);

export default createAppContainer(AppNavigator);
