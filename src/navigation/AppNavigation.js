import { StyleSheet } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import HomeScreen from "../screens/HomeScreen";
import SavedScreen from "../screens/SavedScreen";
import SplashScreen from "../screens/SplashScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import CreateNewsScreen from "../screens/CreateNews";
import NewsScreen from "../screens/NewsScreen";
import NewsDetailScreen from "../screens/NewsDetailScreen";
import CommentScreen from "../screens/CommentScreen";
import HaberDetayEkrani from "../screens/HaberDetay";
import ProfileScreen from "../screens/ProfileScreen";
import EditNewsScreen from "../screens/EditNewsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { colorScheme } = useColorScheme();

  const TabNavigator = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === "Anasayfa") {
            iconName = "home";
          } else if (route.name === "Kaydedilen") {
            iconName = "bookmark-outline";
          } else if (route.name == "Profil") {
            iconName = "person-circle-outline";
          } else if (route.name === "Yazar Haberleri") {
            iconName = "newspaper-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={25}
              color={focused ? "green" : "gray"}
            />
          );
        },
        tabBarActiveTintColor: "green",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: colorScheme == "dark" ? "black" : "white",
        },
      })}
    >
      <Tab.Screen name="Anasayfa" component={HomeScreen} />
      <Tab.Screen name="Yazar Haberleri" component={NewsScreen} />
      <Tab.Screen name="Kaydedilen" component={SavedScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignupScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Create" component={CreateNewsScreen} />
        <Stack.Screen name="NewsDetailScreen" component={NewsDetailScreen} />
        <Stack.Screen name="Comment" component={CommentScreen} />
        <Stack.Screen name="HaberDetay" component={HaberDetayEkrani} />
        <Stack.Screen name="NewsScreen" component={NewsScreen} />
        <Stack.Screen name="EditNewsScreen" component={EditNewsScreen} />
        <Stack.Screen name="HomeTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
