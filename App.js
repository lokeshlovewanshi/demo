import { StatusBar } from "expo-status-bar";
import { Alert, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import Config from "react-native-config";

export default function App() {
  Alert.alert(
    "Current Environment:",
    Constants.manifest.extra.ENV_NAME +
      " tt   " +
      "env " +
      process.env.ENV_NAME +
      "fnfgjfg " +
      Config.ENV_NAME
  );
  return (
    <View style={styles.container}>
      <Text>Hello user this is demo app</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
