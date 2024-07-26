import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen({ navigation }) {
  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleRegister = () => {
    navigation.navigate("SignUp");
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-400">
      <View className="flex-1 flex justify-around my-4">
        <Text className="text-white font-bold text-4xl text-center">
          GoLANG NEWS
        </Text>
        <View className="flex-row  justify-center">
          <Image
            source={require("../../assets/haberokuyanadam.png")}
            style={{ width: 350, height: 350 }}
          />
        </View>
        <View className="flex-row justify-center space-x-3 px-4">
          <TouchableOpacity
            className="flex-1 py-3 bg-yellow-400 rounded-xl"
            onPress={handleLogin}
          >
            <Text className="text-xl font-bold text-center text-gray-700">
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 bg-yellow-400 rounded-xl"
            onPress={handleRegister}
          >
            <Text className="text-xl font-bold text-center text-gray-700">
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
