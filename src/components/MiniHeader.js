import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function MiniHeader({ label }) {
  return (
    <View className="px-4 my-4 justify-between flex-row items-center">
      <Text className="text-2xl  dark:text-white">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
