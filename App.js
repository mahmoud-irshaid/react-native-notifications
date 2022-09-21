import React, { useEffect, useRef } from "react";

import { StyleSheet, Text, View, Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

const registerForPushNotificationsAsync = async () => {
  let token;

  if (Constants.isDevice) {
    // we check if we have access to the notification permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      // if we dontt have access to it, we ask for it
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      // user doesnt allow us to access to the notifications
      alert("Failed to get push token for push notification!");
      return;
    }

    // obtain the expo token
    token = (await Notifications.getExpoPushTokenAsync()).data;

    // log the expo token in order to play with it
    console.log(token);
  } else {
    // notifications only work on physcal devices
    alert("Must use physical device for Push Notifications");
  }

  // some android channel configuration
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  // async function schedulePushNotification() {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "You've got mail! 📬",
  //       body: "Here is the notification body",
  //       data: { data: "goes here" },
  //     },
  //     trigger: { seconds: 2 },
  //   });
  // }
  // schedulePushNotification();

  async function sendPushNotification() {
    let to = "ExponentPushToken[ggroYSApJCFuQPzk5v__gH]";
    const message = {
      to,
      sound: "default",
      title: "Original Title",
      body: "And here is the body!",
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }
  sendPushNotification();
  return token;
};

const StatefullApp = () => {
  let expoToken = "";

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notification
    if (expoToken === "") {
      const token = registerForPushNotificationsAsync();
      expoToken = token;
    }

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        notificationCommonHandler(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification
    // (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        notificationCommonHandler(response.notification);
        notificationNavigationHandler(response.notification.request.content);
      });

    // The listeners must be clear on app unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const notificationCommonHandler = (notification) => {
    // save the notification to reac-redux store
    console.log("A notification has been received", notification);
  };

  const notificationNavigationHandler = ({ data }) => {
    // navigate to app screen
    console.log("A notification has been touched", data);
  };

  return (
    <View style={styles.container}>
      <Text>herere</Text>
    </View>
  );
};

export default function App() {
  return <StatefullApp />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    padding: 50,
  },
});
