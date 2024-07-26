// CustomStatusBar.js

import React from "react";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

const CustomStatusBar = () => {
  const colorScheme = useColorScheme();

  return <StatusBar style={colorScheme === "dark" ? "light" : "auto"} />;
};

export default CustomStatusBar;
