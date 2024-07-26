import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, Switch } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "./firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const rememberMeValue = await AsyncStorage.getItem("rememberMe");
        if (rememberMeValue === "true") {
          const userData = await AsyncStorage.getItem("userData");
          if (userData) {
            navigation.navigate("HomeTabs");
          }
        }
      } catch (error) {
        console.error("AsyncStorage hatası:", error);
      }
    };
    getData();
  }, []);

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Giriş başarılı:", user);
        if (rememberMe) {
          AsyncStorage.setItem("rememberMe", "true");
          AsyncStorage.setItem("userData", JSON.stringify(user));
        } else {
          AsyncStorage.removeItem("rememberMe");
          AsyncStorage.removeItem("userData");
        }
        navigation.navigate("HomeTabs");
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Hata",
          text2: "Hatalı giriş yaptınız. Lütfen tekrar deneyiniz.",
          visibilityTime: 4000,
          style: {
            height: 100,
          },
          text1Style: {
            fontSize: 20,
            fontWeight: "bold",
          },
          text2Style: {
            fontSize: 16,
          },
        });
      });
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    validateEmail(text);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(email)) {
      setErrorMessage("");
    } else {
      setErrorMessage("Geçerli bir email adresi giriniz");
    }
  };

  const register = () => {
    navigation.navigate("SignUp");
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="mt-8">
        <Text className="text-4xl font-bold">Merhaba</Text>
        <Text className="text-4xl font-bold text-blue-500">Hoşgeldiniz!</Text>
        <Text className="text-gray-500 mt-2 text-xl">Sizi özlemiştik.</Text>
      </View>

      <View className="mt-8">
        <View>
          <TextInput
            placeholder="Email Adresinizi giriniz."
            className="border border-gray-300 p-4 rounded-md mb-4"
            style={{
              borderColor: errorMessage !== "" ? "red" : "gray",
            }}
            value={email}
            onChangeText={handleEmailChange}
          />
          {errorMessage !== "" && (
            <Text
              className="mb-4 pl-2"
              style={{ color: "red", marginTop: -12 }}
            >
              {errorMessage}
            </Text>
          )}
        </View>
        <View className="flex-row items-center border border-gray-300 p-4 rounded-md mb-4">
          <TextInput
            placeholder="Şifrenizi giriniz."
            secureTextEntry={!showPassword}
            className="flex-1"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              className="mr-2"
            />
            <Text className="text-gray-500">Beni Hatırla</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-md mt-6"
        onPress={signIn}
      >
        <Text className="text-white text-center">Giriş Yap</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-4">
        <Text>Hesabınız yok mu? </Text>
        <TouchableOpacity onPress={register}>
          <Text className="text-blue-500">Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default LoginScreen;
