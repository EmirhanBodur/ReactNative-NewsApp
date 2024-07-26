import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  const navigation = useNavigation();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-row justify-between items-center mx-4 mt-4">
      <View>
        <Text className="text-2xl text-green-800 dark:text-white uppercase ">
          Native News
        </Text>
      </View>
      <View className="flex-row space-x-4 rounded-full justify-center items-center">
        <TouchableOpacity onPress={toggleColorScheme}>
          <Ionicons
            name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"}
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
