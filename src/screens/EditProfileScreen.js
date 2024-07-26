import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Bu satırı kaldırın
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage, app } from "../screens/firebaseConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useColorScheme } from "nativewind";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    biografi: "",
    website: "",
    profilePhotoUrl: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo({
            fullName: data.fullName || "",
            email: user.email || "",
            biografi: data.biografi || "",
            website: data.website || "",
            profilePhotoUrl: data.profilePhotoUrl || "",
          });
        }
      }
    };
    fetchUserInfo();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        if (userInfo.fullName !== user.displayName) {
          await updateDoc(doc(db, "users", user.uid), {
            fullName: userInfo.fullName,
          });
        }

        if (userInfo.email !== user.email) {
          await auth.updateEmail(user, userInfo.email);
        }

        // Yeni şifre girilmişse, doğrudan şifre güncelleme işlemini gerçekleştir
        if (userInfo.password) {
          await updatePassword(user, userInfo.password);
        }

        await updateDoc(doc(db, "users", user.uid), {
          biografi: userInfo.biografi,
          website: userInfo.website,
          profilePhotoUrl: userInfo.profilePhotoUrl,
        });

        Alert.alert("Başarılı", "Profil başarıyla güncellendi.");
        navigation.goBack();
      } catch (error) {
        console.error("Profil güncelleme hatası:", error.message);
        Alert.alert(
          "Hata",
          "Profil güncellenirken bir hata oluştu: " + error.message
        );
      }
    }
  };

  const handlePhotoUpload = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const user = auth.currentUser;
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setUserInfo({ ...userInfo, profilePhotoUrl: url });
    } catch (error) {
      console.error("Fotoğraf yükleme hatası:", error);
      Alert.alert("Hata", "Fotoğraf yüklenirken bir hata oluştu.");
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      const selectedImage = result.assets[0].uri;
      setUserInfo({ ...userInfo, profilePhotoUrl: selectedImage });
      handlePhotoUpload(selectedImage);
    }
  };

  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      const takenImage = result.assets[0].uri;
      setUserInfo({ ...userInfo, profilePhotoUrl: takenImage });
      handlePhotoUpload(takenImage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4 dark:bg-black">
      <View className="flex flex-row justify-between items-center mb-4 bg-white dark:bg-black">
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons
            name="arrow-back-outline"
            size={25}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-black dark:text-white">
          Profil Düzenle
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons
            name="checkmark-outline"
            size={25}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mb-4 relative bg-white dark:bg-black">
          <TouchableOpacity onPress={handleSelectPhoto}>
            <View className="w-32 h-32 rounded-full bg-white dark:bg-black mb-2 mt-4 relative flex justify-end">
              {userInfo.profilePhotoUrl ? (
                <Image
                  source={{ uri: userInfo.profilePhotoUrl }}
                  style={{ width: "100%", height: "100%", borderRadius: 9999 }}
                />
              ) : (
                <Ionicons
                  name="camera-outline"
                  size={24}
                  className="absolute bottom-0 right-0 mb-1 mr-1"
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTakePhoto}>
            <Ionicons
              name="camera"
              size={24}
              className="absolute bottom-0 left-0 mb-1 ml-1"
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>

        <View className="space-y-4 mt-8 bg-white dark:bg-black">
          <TextInput
            placeholder="Adınız ve Soyadınız"
            style={{
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            className="border p-2 rounded-lg mb-4 "
            value={userInfo.fullName}
            onChangeText={(text) =>
              setUserInfo({ ...userInfo, fullName: text })
            }
          />
          <TextInput
            placeholder="Email Adres"
            style={{
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            className="border p-2 rounded-lg mb-4"
            keyboardType="email-address"
            value={userInfo.email}
            onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
          />
          <TextInput
            placeholder="Şifre"
            style={{
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            className="border p-2 rounded-lg mb-4"
            secureTextEntry={true}
            value={userInfo.password}
            onChangeText={(text) =>
              setUserInfo({ ...userInfo, password: text })
            }
          />
          <TextInput
            placeholder="Şifre Tekrar"
            style={{
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            className="border p-2 rounded-lg mb-4"
            secureTextEntry={true}
            value={userInfo.confirmPassword}
            onChangeText={(text) =>
              setUserInfo({ ...userInfo, confirmPassword: text })
            }
          />
          <TextInput
            placeholder="Biografi"
            style={{
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            className="border p-2 rounded-lg mb-4"
            multiline={true}
            numberOfLines={4}
            value={userInfo.biografi}
            onChangeText={(text) =>
              setUserInfo({ ...userInfo, biografi: text })
            }
          />
          <TextInput
            placeholder="Web Site"
            style={{
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            className="border p-2 rounded-lg mb-4"
            value={userInfo.website}
            onChangeText={(text) => setUserInfo({ ...userInfo, website: text })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
