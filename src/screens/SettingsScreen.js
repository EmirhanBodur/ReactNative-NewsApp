import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const handleProfil = () => {
    navigation.navigate("HomeTabs", { screen: "ProfileScreen" });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("rememberMe");
      await AsyncStorage.removeItem("userData");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <StatusBar style="auto" />
      <View className="flex-1 bg-white dark:bg-black">
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-200 bg-white dark:bg-black">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back"
              size={24}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-dark dark:text-white">
            Ayarlar
          </Text>
          <View className="dark:bg-white" style={{ width: 24 }} />
        </View>
        <View className="py-4 bg-white dark:bg-black">
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-2 mb-4"
            onPress={handleProfil}
          >
            <View className="flex-row items-center bg-white dark:bg-black">
              <Icon
                name="person-outline"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
              <Text className="ml-2 text-base text-black dark:text-white">
                Profil
              </Text>
            </View>
            <Icon
              name="chevron-forward"
              size={24}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between px-4 py-2 mb-4 bg-white dark:bg-black">
            <View className="flex-row items-center bg-white dark:bg-black">
              <Icon
                name="moon-outline"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
              <Text className="ml-2 text-base text-black dark:text-white">
                Dark Mode
              </Text>
            </View>
            <Switch
              value={colorScheme == "dark"}
              onChange={toggleColorScheme}
            />
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-2"
            onPress={handleLogout}
          >
            <View className="flex-row items-center bg-white dark:bg-black">
              <Icon
                name="exit-outline"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
              <Text className="ml-2 text-base text-black dark:text-white">
                Çıkış Yap
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
