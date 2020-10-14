import React from "react";
import {
  ScrollView,
  RefreshControl,
  Dimensions,
  Text,
  View,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import EStyleSheet from "react-native-extended-stylesheet";

import GLOBALS from "../constants/globals";
import { getMainPage, getRecentLoadMore } from "../helpers/MotorsRestApi";
import GridViewItem from "../components/GridViewItemComponent";
import ListViewItem from "../components/ListViewItemComponent";
import AppBottomNavigation from "../components/AppBottomNavigation";
import _ from "lodash";
import AsyncStorage from "@react-native-community/async-storage";
import Translation from "../helpers/Translation";
import AdvertisingComponent from "../components/AdvertisingComponent";

const entireScreenWidth = Dimensions.get("window").width;
EStyleSheet.build({ $rem: entireScreenWidth / 380 });

let _this;

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    _this = this;

    this.state = {
      mpLoading: true,
      refreshing: false,
      isLoadMore: false,
      viewType: "",
      featured: {},
      recent: {},
      mainColor: "",
      secondColor: "",
      adPosition: "bottom",
      limit: 0,
      offset: 0,
    };
  }

  static navigationOptions = ({ navigation }) => {
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
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Image
            style={{ width: "auto", height: 24, resizeMode: "contain" }}
            source={require("../assets/img/logo-dark.png")}
          />
        </View>
      ),
      headerLeft: <View style={styles.invisibleBlock}></View>,
      headerRight: <View style={styles.invisibleBlock}></View>,
    };
  };

  async componentWillMount() {
    try {
      let mc = await AsyncStorage.getItem("main_color");
      let sc = await AsyncStorage.getItem("secondary_color");
      let settings = await AsyncStorage.getItem("ads_settings");
      let adsSettings = JSON.parse(settings);

      _this.setState({
        mainColor: mc,
        secondColor: sc,
        adPosition:
          _.get(adsSettings, "banner_position") != null
            ? _.get(adsSettings, "banner_position")
            : "bottom",
      });
    } catch (e) {}

    await getMainPage().then((responseJson) => {
      this.setState(
        {
          mpLoading: false,
          refreshing: false,
          viewType: responseJson.viewType,
          featured: responseJson.featured,
          recent: responseJson.recent,
          limit: responseJson.limit,
          offset: responseJson.offset,
        },
        function () {}
      );
    });
  }

  componentDidMount() {}

  _onRefresh = () => {
    this.setState({ mpLoading: true, refreshing: true });
    getMainPage().then((responseJson) => {
      this.setState(
        {
          mpLoading: false,
          refreshing: false,
          viewType: responseJson.viewType,
          featured: responseJson.featured,
          recent: responseJson.recent,
        },
        function () {}
      );
    });
  };

  render() {
    if (this.state.refreshing) {
      return (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
        ></ScrollView>
      );
    }

    if (this.state.mpLoading) {
      return (
        <View style={{ flex: 1, alignItems: "center", paddingTop: 100 }}>
          <ActivityIndicator />
        </View>
      );
    }

    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        {_this.state.adPosition == "top" ? (
          <AdvertisingComponent />
        ) : (
          <View></View>
        )}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
        >
          <View>
            <View style={styles.similarWrap}>
              <Text style={styles.similarMainTitle}>
                <Translation str="recomended" />
              </Text>
              <ScrollView horizontal={true}>
                {_.map(this.state.featured, function (data) {
                  return (
                    <View key={data.ID} style={styles.similarItemWrap}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          navigate("Details", { listingId: data.ID });
                        }}
                      >
                        <View style={styles.similarImgWrap}>
                          <Image
                            style={styles.similarImg}
                            source={{ uri: data.img }}
                          />
                          <View
                            style={[
                              styles.similarPriceWrap,
                              { backgroundColor: _this.state.mainColor },
                            ]}
                          >
                            <Text style={styles.similarPrice}>
                              {data.price}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.similarTitleWrap}>
                          <Text style={styles.similarTitle} numberOfLines={2}>
                            {data.title}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.recentWrap}>
              <Text style={styles.mainTitle}>
                <Translation str="recently_added" />
              </Text>
              {this.state.viewType == "main_ra_list_view" ? (
                <FlatList
                  style={styles.flatStyle}
                  data={this.state.recent}
                  extraData={this.state}
                  renderItem={({ item }) => (
                    <ListViewItem
                      navigation={this.props.navigation}
                      key={item.ID}
                      invId={item.ID}
                      featureImg={item.imgUrl}
                      title={item.list.title}
                      price={item.price}
                      imgsSrc={item.gallery}
                      imgsNum={item.imgCount}
                      infOneIcon={item.list.infoOneIcon}
                      infOneTitle={item.list.infoOneTitle}
                      infOneDesc={item.list.infoOneDesc}
                      infTwoIcon={item.list.infoTwoIcon}
                      infTwoTitle={item.list.infoTwoTitle}
                      infTwoDesc={item.list.infoTwoDesc}
                      infThreeIcon={item.list.infoThreeIcon}
                      infThreeTitle={item.list.infoThreeTitle}
                      infThreeDesc={item.list.infoThreeDesc}
                      infFourIcon={item.list.infoFourIcon}
                      infFourTitle={item.list.infoFourTitle}
                      infFourDesc={item.list.infoFourDesc}
                      hasPadding={false}
                      doReplace={false}
                    />
                  )}
                  keyExtractor={({ item }, index) => index.toString()}
                />
              ) : (
                <FlatList
                  style={styles.flatStyle}
                  data={this.state.recent}
                  extraData={this.state}
                  renderItem={({ item }) => (
                    <GridViewItem
                      navigation={this.props.navigation}
                      key={item.ID}
                      invId={item.ID}
                      featureImg={item.imgUrl}
                      title={item.grid.title}
                      subtitle={item.grid.subTitle}
                      price={item.price}
                      imgsSrc={item.gallery}
                      imgsNum={item.imgCount}
                      infIcon={item.grid.infoIcon}
                      infTitle={item.grid.infoTitle}
                      infDesc={item.grid.infoDesc}
                    />
                  )}
                  keyExtractor={({ item }, index) => index.toString()}
                />
              )}
            </View>
          </View>
        </ScrollView>
        {_this.state.adPosition == "bottom" ? (
          <AdvertisingComponent />
        ) : (
          <View></View>
        )}
        <AppBottomNavigation
          navigation={this.props.navigation}
          activeTab="home3"
        />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    position: "absolute",
    top: 50,
    left: 50,
  },

  mainTitle: {
    fontSize: "14rem",
    fontWeight: "700",
    paddingTop: "20rem",
    paddingBottom: "20rem",
    color: GLOBALS.COLOR.title,
    borderBottomColor: GLOBALS.COLOR.gray88,
    borderBottomWidth: "1rem",
    borderStyle: "solid",
  },

  svgStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "34rem",
    height: "34rem",
    borderColor: GLOBALS.COLOR.gray88,
    borderRadius: 34,
    borderWidth: 1,
    marginLeft: "10rem",
    marginRight: "10rem",
  },

  invisibleBlock: {
    width: "30rem",
  },

  indicatorWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingBottom: "10rem",
    height: "60rem",
  },

  indicatorWrapEmpty: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingBottom: "10rem",
  },

  similarWrap: {
    paddingTop: "20rem",
    paddingBottom: "20rem",
    paddingLeft: "10rem",
    backgroundColor: GLOBALS.COLOR.title,
  },

  similarMainTitle: {
    marginTop: "10rem",
    marginBottom: "30rem",
    marginLeft: "10rem",
    marginRight: "20rem",
    color: GLOBALS.COLOR.white,
    fontSize: "14rem",
    fontWeight: "600",
  },

  similarItemWrap: {
    width: "150rem",
    marginLeft: "10rem",
    marginRight: "10rem",
  },

  similarImgWrap: {
    position: "relative",
  },

  similarImg: {
    height: "100rem",
  },

  similarPriceWrap: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  similarPrice: {
    fontSize: "14rem",
    color: GLOBALS.COLOR.white,
    fontWeight: "700",
  },

  similarTitleWrap: {
    flex: 1,
    backgroundColor: GLOBALS.COLOR.dark,
    padding: "12rem",
  },

  similarTitle: {
    fontSize: "12rem",
    fontWeight: "500",
    color: GLOBALS.COLOR.white,
  },

  recentWrap: {
    paddingLeft: "20rem",
    paddingRight: "20rem",
  },
});
