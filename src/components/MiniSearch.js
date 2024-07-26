import React from "react";
import { TextInput, View } from "react-native";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useColorScheme } from "nativewind";

export default function MiniSearch() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  return (
    <View className="flex-row items-center border-2 border-black dark:border-white rounded-lg p-4 mx-4 mt-4">
      <TextInput
        style={{ flex: 1, color: colorScheme === "dark" ? "white" : "black" }}
        placeholder="Ara"
        placeholderTextColor={colorScheme === "dark" ? "#fff" : "#000"}
      />
      <MagnifyingGlassIcon
        size={20}
        color={colorScheme === "dark" ? "white" : "black"}
      />
    </View>
  );
}
