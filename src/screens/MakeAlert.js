import React from "react";
import {
  ScrollView,
  Dimensions,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";

import AsyncStorage from "@react-native-community/async-storage";
import Translation from "../helpers/Translation";
import EStyleSheet from "react-native-extended-stylesheet";
import { doCarAlert } from "../helpers/MotorsRestApi";
import GLOBALS from "../constants/globals";
import Ico from "../components/Ico";
import AppBottomNavigation from "../components/AppBottomNavigation";
import Toast, { DURATION } from "react-native-easy-toast";
import _ from "lodash";
import firebase, { RNFirebase } from "react-native-firebase";

const fcmChannelID = "maliparkApp";
const firebase_server_key =
  "AAAAjge7Xy0:APA91bE4Q-_hC-m7fq34kgp7gdjfTVQvbyhY9lTvr1hBmkXfD4Xr2zbKDLP9mpQlGsyPJH46K41o2hvW7duYK7ylU0QmboVH97_apOOE3lxSeGhf7Hf5p4GloVRF0_OfIiwN0Nfmnsp3";

const entireScreenWidth = Dimensions.get("window").width;
EStyleSheet.build({ $rem: entireScreenWidth / 380 });

let _this;
let alertData = {};

export default class MakeAlert extends React.Component {
  constructor(props) {
    super(props);

    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    _this = this;

    _this.state = {
      loading: false,
      hidePass: true,
      mainColor: "",
      secondColor: "",
      listViewData: data,
      newContact: "",
      currentUser: "",
      firebase_messaging_token: "",
      firebase_messaging_message: "",
      firebase_notification: "",
      firebase_send: "",
    };
  }

  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      headerStyle: {
        height: 50,
        borderBottomWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
      },
      headerTitle: (
        <View style={styles.appMainTitle}>
          <Text style={styles.center}>
            <Translation str="alert" />
          </Text>
        </View>
      ),
      headerLeft: (
        <View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.svgStyle}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ico
              icoName="arrow-left1"
              icoColor={GLOBALS.COLOR.gray88}
              icoSize={16}
            />
          </TouchableOpacity>
        </View>
      ),
      headerRight: <View style={styles.invisibleBlock}></View>,
    };
  };

  async componentDidMount() {
    this.addNotificationListeners();
  }

  async componentWillMount() {
    try {
      let mc = await AsyncStorage.getItem("main_color");
      let sc = await AsyncStorage.getItem("secondary_color");

      _this.setState({
        mainColor: mc,
        secondColor: sc,
      });
    } catch (e) {
      console.log("error from AsyncStorage Colors: ", e);
    }
  }

  addNotificationListeners() {
    console.log("receiveNotifications");
    this.messageListener = firebase.messaging().onMessage((message) => {
      // "Headless" Notification
      console.log("onMessage");
    });

    this.notificationInitialListener = firebase
      .notifications()
      .getInitialNotification()
      .then((notification) => {
        if (notification) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          // Get information about the notification that was opened
          console.log("onInitialNotification");
        }
      });

    this.notificationDisplayedListener = firebase
      .notifications()
      .onNotificationDisplayed((notification) => {
        console.log("onNotificationDisplayed");
      });

    this.notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        console.log("onNotification");
        notification.android.setChannelId(fcmChannelID);
        firebase
          .notifications()
          .displayNotification(notification)
          .catch((err) => {
            console.log(err);
          });

        // Process your notification as required

        // #1: draw in View
        var updatedText =
          this.state.firebase_notification +
          "\n" +
          "[" +
          new Date().toLocaleString() +
          "]" +
          "\n" +
          notification.title +
          ":" +
          notification.body +
          "\n";

        this.setState({ firebase_notification: updatedText });
      });

    this.tokenRefreshListener = firebase
      .messaging()
      .onTokenRefresh((fcmToken) => {
        // Process your token as required
        console.log("onTokenRefresh");
      });
  }
  // Send Push Notifications to Server
  sendToServer = async (str) => {
    console.log("sendToServer");
    console.log(str);

    // SEND NOTIFICATION THROUGH FIREBASE
    // Workflow: React -> Firebase -> Target Devices

    fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "key=" + firebase_server_key,
      },
      body: JSON.stringify({
        registration_ids: [this.state.firebase_messaging_token],
        notification: {
          title: "Title",
          body: str,
        },
        data: {
          key1: "value1",
          key2: "value2",
          key3: 23.56565,
          key4: true,
        },
      }),
    })
      .then((response) => {
        console.log("Request sent!");
        console.log(response);
        console.log("FCM Token: " + this.state.firebase_messaging_token);
        console.log("Message: " + str);
        this.setState({ firebase_send: "" });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  _doAlert = () => {
    if (Object.keys(alertData).length > 0) {
      _this.setState({
        loading: true,
      });

      const formData = new FormData();

      _.map(alertData, function (data, index) {
        if (index == "avatar") {
          formData.append(index, data[0]["base64"]);
        } else {
          formData.append(index, data);
        }
      });

      doCarAlert(formData).then((responseJson) => {
        if (responseJson.code == 200) {
          _this._showToast(responseJson.message);

          AsyncStorage.setItem(
            "userData",
            JSON.stringify(responseJson.user),
            () => {}
          );

          _this.props.navigation.navigate("Main Page");
        } else {
          _this._showToast(responseJson.message);
        }

        _this.setState({
          loading: false,
        });
      });
    } else {
    }
  };

  _setSelectedImage = (img) => {
    alertData["avatar"] = img;

    _this.setState({
      update: _this.state.update ? false : true,
    });
  };

  _showToast = (text, color) => {
    _this.refs["toast"].show(text, 3000);
  };

  _showPass = () => {
    _this.setState({
      hidePass: _this.state.hidePass ? false : true,
    });
  };

  render() {
    return (
      <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.mainWrap}>
            <View style={styles.alertWrap}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  <Translation str="name" />
                </Text>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  onChangeText={(text) => {
                    alertData["car_name"] = text;
                  }}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  <Translation str="model" />
                </Text>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  onChangeText={(text) => {
                    alertData["car_model"] = text;
                  }}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  <Translation str="color" />
                </Text>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  onChangeText={(text) => {
                    alertData["car_color"] = text;
                  }}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  <Translation str="year" />
                </Text>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  onChangeText={(text) => {
                    alertData["car_year"] = text;
                  }}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  <Translation str="marque" />
                </Text>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  onChangeText={(text) => {
                    alertData["car_marque"] = text;
                  }}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  <Translation str="price" />
                </Text>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  onChangeText={(text) => {
                    alertData["car_price"] = text;
                  }}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  <Translation str="photo" />
                </Text>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.inputAvatar}
                  editable={false}
                  value={
                    typeof alertData["photo"] != "undefined"
                      ? alertData["photo"][0]["src"]
                      : ""
                  }
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.inputIco}
                  onPress={() => {
                    _this.props.navigation.navigate("ChooseImage", {
                      _setSelectedImage: _this._setSelectedImage,
                    });
                  }}
                >
                  <Ico
                    icoName="camera1"
                    icoColor={GLOBALS.COLOR.gray88}
                    icoSize={16}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.btn}>
                {_this.state.loading ? (
                  <View style={styles.indicator}>
                    <ActivityIndicator
                      size="small"
                      color={_this.state.secondColor}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.btn_l,
                      { backgroundColor: _this.state.mainColor },
                    ]}
                    onPress={() => {
                      this.sendToServer(alertData);
                    }}
                  >
                    <Text style={styles.btnText}>
                      <Translation str="Envoyer" />
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        <AppBottomNavigation
          navigation={this.props.navigation}
          activeTab="lnr-check"
        />
        <Toast ref="toast" positionValue={180} />
      </KeyboardAvoidingView>
    );
  }
}

const styles = EStyleSheet.create({
  mainWrap: {
    flex: 1,
    position: "relative",
    height: "100%",
  },

  appMainTitle: {
    flex: 1,
    justifyContent: "center",
  },

  invisibleBlock: {
    width: "30rem",
  },

  svgStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "33rem",
    height: "33rem",
    borderColor: GLOBALS.COLOR.gray88,
    borderRadius: 50,
    borderWidth: 1,
    marginLeft: "10rem",
    marginRight: "10rem",
  },

  center: {
    textAlign: "center",
  },

  alertWrap: {
    flexDirection: "column",
    flexWrap: "nowrap",
    width: "100%",
    paddingTop: "10rem",
    paddingBottom: "10rem",
  },

  inputWrap: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: "20rem",
    paddingRight: "20rem",
    paddingTop: "10rem",
    paddingBottom: "10rem",
    borderBottomWidth: 1,
    borderColor: GLOBALS.COLOR.hr,
    borderStyle: "solid",
  },

  label: {
    width: "30%",
    fontSize: "14rem",
    fontWeight: "600",
    color: GLOBALS.COLOR.title,
  },

  input: {
    width: "70%",
    height: "40rem",
    fontSize: "14rem",
    color: GLOBALS.COLOR.title,
    backgroundColor: GLOBALS.COLOR.bg,
    borderRadius: "5rem",
    paddingLeft: "10rem",
    paddingRight: "10rem",
  },

  inputAvatar: {
    width: "70%",
    height: "40rem",
    fontSize: "14rem",
    color: GLOBALS.COLOR.title,
    backgroundColor: GLOBALS.COLOR.bg,
    borderRadius: "5rem",
    paddingLeft: "10rem",
    paddingRight: "35rem",
  },

  btn: {
    width: "100%",
    marginTop: "30rem",
    paddingLeft: "20rem",
    paddingRight: "20rem",
  },

  btn_l: {
    width: "100%",
    height: "55rem",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "30rem",
  },

  btnText: {
    color: GLOBALS.COLOR.white,
    fontSize: "15rem",
    fontWeight: "600",
  },

  inputIco: {
    position: "absolute",
    right: "25rem",
    padding: "10rem",
  },

  singUp: {
    width: "100%",
    height: "55rem",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "30rem",
    borderWidth: 1,
    borderColor: GLOBALS.COLOR.white,
    borderStyle: "solid",
    marginTop: "15rem",
  },

  indicator: {
    width: "100%",
    height: "55rem",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "center",
  },
});
