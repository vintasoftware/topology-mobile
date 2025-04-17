import React from "react";
import { StyleSheet, View } from "react-native";

// import { Chat } from "../components/Chat";

export default function ChatScreen() {
  return <View style={styles.container}>{/* <Chat /> */}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
});
