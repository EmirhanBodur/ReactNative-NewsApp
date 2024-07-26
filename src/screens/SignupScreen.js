import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [secureEntry, setSecureEntry] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoSelected, setPhotoSelected] = useState(false);
  const [userType, setUserType] = useState("Okuyucu");
  const [writerPassword, setWriterPassword] = useState("");
  const [biografi, setBiografi] = useState("");
  const [website, setWebsite] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Yüklenme durumunu takip etmek için state ekledik
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Eğer profil fotoğrafı seçilmişse ve yüklendiğinde, photoSelected state'ini true olarak ayarlayalım
    if (profilePhoto) {
      setPhotoSelected(true);
    }
  }, [profilePhoto]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const showSuccessAlert = () => {
    Toast.show({
      type: "success",
      position: "top",
      text1: "Başarı",
      text2: "Hesabınız başarıyla oluşturuldu!",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
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
  };

  const checkWriterPassword = async (writerPassword) => {
    try {
      const writerPasswordsRef = doc(
        db,
        "WriterPasswords",
        "n3cHUUcGSKMh7yl0unq2"
      );
      const docSnap = await getDoc(writerPasswordsRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.password === writerPassword) {
          return true; // Şifre eşleşti
        } else {
          return false; // Şifre eşleşmedi
        }
      } else {
        return false; // Belge bulunamadı
      }
    } catch (error) {
      console.error("Yazar şifresi kontrol edilirken hata oluştu:", error);
      return false;
    }
  };

  const handleSignUp = async () => {
    // Alanların doğrulanması
    const errors = {};
    if (!fullName) errors.fullName = "Bu alan boş bırakılamaz";
    if (!email) errors.email = "Bu alan boş bırakılamaz";
    if (!password) errors.password = "Bu alan boş bırakılamaz";
    if (!biografi) errors.biografi = "Bu alan boş bırakılamaz";
    if (!profilePhoto) errors.profilePhoto = "Lütfen profil fotoğrafı seçiniz.";
    if (userType === "Yazar" && !writerPassword)
      errors.writerPassword = "Bu alan boş bırakılamaz";

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true); // Kayıt işlemi başlamadan önce loading state'ini true olarak ayarla

    try {
      if (userType === "Yazar") {
        const isWriterPasswordCorrect = await checkWriterPassword(
          writerPassword
        );
        if (!isWriterPasswordCorrect) {
          setLoading(false); // Hata oluştuğunda loading state'ini false olarak ayarla
          Alert.alert("Yazar şifresi yanlış.");
          return;
        }
      }

      // Profil fotoğrafı seçildiyse ve yüklendiyse Firebase Storage'a kaydet
      let profilePhotoUrl = null;
      if (photoSelected && profilePhoto) {
        const response = await fetch(profilePhoto);
        const blob = await response.blob();
        const storageRef = ref(
          storage,
          `profilePhotos/${auth.currentUser.uid}`
        );
        await uploadBytes(storageRef, blob);
        profilePhotoUrl = await getDownloadURL(storageRef);

        if (profilePhotoUrl) {
          console.log(
            "Profil fotoğrafı başarıyla yüklendi. URL:",
            profilePhotoUrl
          );
        } else {
          console.log("Profil fotoğrafının indirme URL'si alınamadı.");
        }
      } else {
        console.log("Fotoğraf seçilmedi.");
      }

      // 1. Kullanıcıyı oluştur ve kaydet
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Kullanıcının profilini güncelle
      await updateProfile(user, { displayName: fullName });

      // 3. Firestore'a kullanıcı verisini kaydet
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        profilePhotoUrl: profilePhotoUrl || "",
        userType: userType,
        biografi: biografi,
        website: website,
      });

      console.log("Kullanıcı başarıyla kaydedildi: ", userCredential);

      setLoading(false);
      showSuccessAlert();
    } catch (error) {
      setLoading(false); // Hata oluştuğunda loading state'ini false olarak ayarla
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Hata",
        text2:
          "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
        visibilityTime: 4000,
        style: {
          height: 200,
        },
        text1Style: {
          fontSize: 20,
          fontWeight: "bold",
        },
        text2Style: {
          fontSize: 16,
        },
      });
    }
  };

  const handleChoosePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Kamera rulosuna erişim izni gerekiyor.");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!pickerResult.cancelled) {
        const uri = pickerResult.assets[0].uri; // assets kullanarak doğru URI'yi al
        console.log("Seçilen Fotoğraf URI'si:", uri);
        setProfilePhoto(uri);
      } else {
        console.log("Fotoğraf seçme işlemi iptal edildi.");
        Alert.alert("Fotoğraf seçme işlemi iptal edildi.");
      }
    } catch (error) {
      console.error("Fotoğraf seçme ve yükleme hatası:", error);
      Alert.alert("Fotoğraf seçme ve yükleme hatası:", error.message);
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    validateEmail(text);
  };

  const validateEmail = (email) => {
    // Email adresi doğrulama regex'i
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailPattern.test(email)) {
      setErrorMessage(""); // Geçerli ise hata mesajını temizle
    } else {
      setErrorMessage("Geçerli bir email adresi giriniz");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false} // Dikey scroll çubuğunu gizler
      >
        <View className="mt-8">
          <Text className="text-4xl font-bold text-blue-500">Merhaba!</Text>
          <Text className="text-gray-100 mt-2 text-xl">
            Güncel haberler için hemen kayıt ol.
          </Text>
        </View>

        <View className="mt-8">
          <View className="flex-row justify-center mb-4 bg-gray-700">
            <TouchableOpacity onPress={handleChoosePhoto}>
              <View className="border border-gray-400 rounded-full h-40 w-40">
                <Image
                  source={{ uri: profilePhoto }}
                  style={{ width: "100%", height: "100%" }}
                  className="w-full h-full rounded-full"
                />
                {!profilePhoto && (
                  <View className="absolute flex m-8 items-center justify-center">
                    <Ionicons name="camera-outline" size={24} color="gray" />
                    <Text className="text-black text-center">
                      Profil fotoğrafı eklemek için tıkla
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
          {validationErrors.profilePhoto && (
            <Text className="text-red-500 mb-4 text-center">
              {validationErrors.profilePhoto}
            </Text>
          )}

          <TextInput
            placeholder="Adınızı ve Soyadınızı giriniz."
            className="border border-gray-300 p-4 rounded-md mb-4"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              // Kullanıcının adını girdiği zaman hata mesajını kaldır
              if (validationErrors.fullName) {
                setValidationErrors((prevErrors) => {
                  return { ...prevErrors, fullName: "" };
                });
              }
            }}
          />
          {validationErrors.fullName && (
            <Text className="text-red-500 mb-4 mt-[-12px]">
              {validationErrors.fullName}
            </Text>
          )}
          <View>
            <TextInput
              placeholder="Email Adresinizi giriniz."
              className="border border-gray-300 p-4 rounded-md mb-4"
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
            {validationErrors.email && (
              <Text className="text-red-500 mb-4 mt-[-12px]">
                {validationErrors.email}
              </Text>
            )}
          </View>
          <TextInput
            placeholder="Biyografinizi giriniz."
            className="border  border-gray-200 p-4 rounded-md mb-4"
            value={biografi}
            onChangeText={setBiografi}
          />
          {validationErrors.biografi && (
            <Text className="text-red-500 mb-4 mt-[-12px]">
              {validationErrors.biografi}
            </Text>
          )}
          <TextInput
            placeholder="Bir web site adresiniz varsa giriniz."
            className="border border-gray-300 p-4 rounded-md mb-4"
            value={website}
            onChangeText={setWebsite}
          />
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
          {validationErrors.password && (
            <Text className="text-red-500 mb-4 mt-[-12px]">
              {validationErrors.password}
            </Text>
          )}

          {/* Yazar tip seçim alanı başlangıç */}
          <View>
            <View className="flex-row justify-between ">
              <TouchableOpacity
                onPress={() => handleUserTypeChange("Okuyucu")}
                className="rounded-md p-4 flex-1 mr-2"
                style={{
                  backgroundColor:
                    userType === "Okuyucu" ? "#3182CE" : "#E2E8F0",
                }}
              >
                <Text
                  className="text-center"
                  style={{
                    color: userType === "Okuyucu" ? "white" : "gray",
                  }}
                >
                  Okuyucu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleUserTypeChange("Yazar")}
                className="rounded-md p-4 flex-1"
                style={{
                  backgroundColor: userType === "Yazar" ? "#3182CE" : "#E2E8F0",
                }}
              >
                <Text
                  className="text-center"
                  style={{
                    color: userType === "Yazar" ? "white" : "gray",
                  }}
                >
                  Yazar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {userType === "Yazar" && (
            <View className="form space-y-2 mt-4">
              <TextInput
                className="border border-gray-300 p-4 rounded-md "
                placeholder="Yazar şifresini girin"
                value={writerPassword}
                onChangeText={setWriterPassword}
              />
              {validationErrors.writerPassword && (
                <Text className="text-red-500 mb-4">
                  {validationErrors.writerPassword}
                </Text>
              )}
            </View>
          )}
        </View>
        {/* Yazar tipi seçim alanı bitiş */}

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-md mt-6"
          onPress={handleSignUp}
          disabled={loading} // Yüklenme durumunda butonu devre dışı bırak
        >
          {loading ? (
            <ActivityIndicator color="#fff" /> // Yüklenme durumunda ActivityIndicator göster
          ) : (
            <Text className="text-white text-center">Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text>Bir hesabınız var mı? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text className="text-blue-500">Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

export default SignupScreen;
