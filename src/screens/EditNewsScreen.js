import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { auth, storage } from "../screens/firebaseConfig";
import { useColorScheme } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditNewsScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("sports");
  const [photoUri, setPhotoUri] = useState(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const categories = [
    { label: "Spor", value: "Spor" },
    { label: "Gündem", value: "Gündem" },
    { label: "Ekonomi", value: "Ekonomi" },
    { label: "Dünya", value: "Dünya" },
    { label: "Sağlık", value: "Sağlık" },
    { label: "Yaşam", value: "Yaşam" },
    { label: "Kültür-Sanat", value: "Kültür-Sanat" },
    { label: "Eğitim", value: "Eğitim" },
    { label: "Borsa", value: "Borsa" },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    // EditNewsScreen'e yönlendirildiğinde, haber verilerini al
    const newsData = route.params?.newsData;
    if (newsData) {
      const { title, details, category, photoUrl } = newsData;
      setTitle(title);
      setDetails(details);
      setSelectedCategory(category);
      setPhotoUri(photoUrl);
    }
  }, []);

  const handleChoosePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Kamera rulosuna erişim izni gerekiyor");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!pickerResult.cancelled) {
        const uri = pickerResult.assets[0].uri;
        console.log("Seçilen Fotoğraf URI'si:", uri);
        setPhotoUri(uri);
      } else {
        console.log("Fotoğraf seçme işlemi iptal edildi.");
        Alert.alert("Fotoğraf seçme işlemi iptal edildi.");
      }
    } catch (error) {
      console.error("Fotoğraf seçme ve yükleme hatası:", error);
      Alert.alert("Fotoğraf seçme ve yükleme hatası:", error.message);
    }
  };

  const handleUpdate = async () => {
    if (!title || !details || !selectedCategory || !photoUri) {
      Alert.alert("Tüm alanları doldurun ve bir fotoğraf seçin");
      return;
    }
    try {
      const user = auth.currentUser;

      if (!user) {
        // Kullanıcı oturum açmamış
        Alert.alert("Kullanıcı girişi yapmadınız.");
        return;
      }

      // Firestore'a erişim sağla
      const db = getFirestore();

      // Kullanıcı belgesini Firestore'dan al
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Kullanıcı belgesi bulunamadı
        Alert.alert("Kullanıcı bilgileri bulunamadı.");
        return;
      }

      // Kullanıcının tam adını al
      const userData = userDocSnap.data();
      const fullName = userData.fullName;

      // Seçilen fotoğrafı Firebase Storage'a yükle
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const photoRef = ref(storage, `news_photos/${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(photoRef, blob);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Yükleme hatası:", error);
          Alert.alert("Yükleme hatası:", error.message);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Haberi Firestore'da güncelle
            const newsData = route.params.newsData;
            const newsRef = doc(db, "news", newsData.id);
            await setDoc(newsRef, {
              uid: user.uid,
              title,
              details,
              category: selectedCategory,
              photoUrl: downloadURL,
              authorName: fullName,
              createdAt: new Date().toISOString(),
            });

            Alert.alert("Haber başarıyla güncellendi");
            navigation.goBack();
          } catch (error) {
            console.error("Haber güncellenirken hata:", error);
            Alert.alert("Haber güncellenirken hata:", error.message);
          }
        }
      );
    } catch (error) {
      console.error("Haber güncellenirken hata:", error);
      Alert.alert("Haber güncellenirken hata:", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-row justify-between items-center mb-4 p-4 bg-white dark:bg-black">
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons
            name="arrow-back-outline"
            size={25}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text className="font-bold text-xl text-black dark:text-white">
          Haber Yaz
        </Text>
        <TouchableOpacity onPress={handleUpdate}>
          <Ionicons
            name="checkmark-outline"
            size={25}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 p-5">
        <View className="mb-5 bg-white dark:bg-black">
          <TouchableOpacity onPress={handleChoosePhoto}>
            <View
              style={{
                height: 200,
                backgroundColor: "#f0f0f0",
                borderWidth: 2,
                borderColor: "#ccc",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {!photoUri ? (
                <TouchableOpacity onPress={handleChoosePhoto}>
                  <View className="items-center">
                    <Text className="text-gray mt-2 text-black">
                      Haber Fotoğrafı Ekle
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Image
                  source={{ uri: photoUri }}
                  className="w-full h-full rounded-md"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-5 bg-white dark:bg-black">
          <Text className="text-gray-800 mb-2 text-black dark:text-white">
            Haber Başlığı
          </Text>
          <TextInput
            style={{
              borderBottomWidth: 2,
              borderColor: "#ccc",
              fontSize: 16,
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            placeholder="Haber Başlığı"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-5">
          <Text className="text-gray-800 mb-2 text-black dark:text-white">
            Haber İçeriği
          </Text>
          <TextInput
            style={{
              borderBottomWidth: 2,
              borderColor: "#ccc",
              fontSize: 16,
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
            }}
            placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
            placeholder="Haber Detaylarını Giriniz."
            multiline
            numberOfLines={4}
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-black dark:text-white">
            Haber Kategorisi
          </Text>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedCategory(itemValue)
            }
            style={{
              height: 40,
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: colorScheme === "dark" ? "white" : "black",
              borderWidth: 2,
            }}
          >
            {categories.map((category, index) => (
              <Picker.Item
                key={index}
                label={category.label}
                value={category.value}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          className="bg-blue-500 p-2 rounded-md items-center"
          onPress={handleUpdate}
        >
          <Text className="text-white font-xl">Yayınla</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditNewsScreen;
