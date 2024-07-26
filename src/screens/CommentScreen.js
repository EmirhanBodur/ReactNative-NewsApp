import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { db, auth, app, storage } from "./firebaseConfig"; // db nesnesini içe aktar

export default function CommentScreen({ route }) {
  const navigation = useNavigation();
  const { newsId } = route.params;
  const [comment, setComment] = useState(""); // Kullanıcıdan alınan yorumu tutacak state
  const [comments, setComments] = useState([]);
  const { colorScheme, toggleColorScheme } = useColorScheme();

  useEffect(() => {
    // İlgili haberle ilişkili yorumları getir
    const unsubscribe = onSnapshot(
      query(
        collection(db, "comments"),
        where("newsId", "==", newsId), // Haber kimliğine göre yorumları filtrele
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        const commentsData = [];
        snapshot.forEach((doc) => {
          commentsData.push({ id: doc.id, ...doc.data() });
        });
        setComments(commentsData);
      }
    );
    return () => unsubscribe();
  }, [newsId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const getCurrentUserName = async () => {
    try {
      const user = auth.currentUser;
      if (user && user.displayName) {
        return user.displayName; // Kullanıcı adını döndür
      } else {
        throw new Error("Kullanıcı adı alınamadı");
      }
    } catch (error) {
      console.error("Kullanıcı adı alınırken bir hata oluştu:", error);
      throw error;
    }
  };

  const getCurrentUserPhotoURL = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Kullanıcı oturumu açmamış");
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        return userData.profilePhotoUrl; // Firestore'dan kullanıcı fotoğraf URL'sini döndür
      } else {
        throw new Error("Kullanıcı belgesi bulunamadı");
      }
    } catch (error) {
      console.error(
        "Kullanıcı fotoğraf URL'sini alınırken bir hata oluştu:",
        error
      );
      throw error;
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const userName = await getCurrentUserName();
      const userPhotoURL = await getCurrentUserPhotoURL(); // Fotoğraf URL'sini al

      await addCommentToFirestore(comment, userName, userPhotoURL); // Yorumu ve kullanıcı bilgilerini Firestore'a kaydet

      console.log("Yorum başarıyla kaydedildi:", comment);
      setComment(""); // Yorumu gönderdikten sonra inputu temizle
    } catch (error) {
      console.error("Yorum kaydedilirken bir hata oluştu:", error);
    }
  };

  const addCommentToFirestore = async (comment, userName, userPhotoURL) => {
    try {
      await addDoc(collection(db, "comments"), {
        content: comment,
        userName: userName,
        userPhotoURL: userPhotoURL,
        timestamp: new Date(),
        newsId: newsId, // Yorumu hangi haberle ilişkilendirdiğimizi belirtmek için newsId'yi ekleyin
      });
    } catch (error) {
      console.error("Yorum kaydedilirken bir hata oluştu:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 bg-white dark:bg-black">
          <ScrollView>
            <View className="p-4 flex-1 justify-center bg-white dark:bg-black">
              <View className="flex-row items-center justify-between mb-4 bg-white dark:bg-black">
                <TouchableOpacity onPress={handleBack}>
                  <FontAwesome
                    name="arrow-left"
                    size={24}
                    color={colorScheme === "dark" ? "white" : "black"}
                  />
                </TouchableOpacity>
                <Text className="text-center font-bold text-xl text-black dark:text-white">
                  Yorumlar
                </Text>
                <View></View>
              </View>
              {comments.map((comment) => (
                <View
                  key={comment.id}
                  className="flex-row items-center mb-4 bg-white dark:bg-black"
                >
                  <Image
                    source={{ uri: comment.userPhotoURL }}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <View className="flex-1 bg-white dark:bg-black">
                    <Text className="font-bold mb-1 text-black dark:text-white">
                      {comment.userName}
                    </Text>
                    <Text className="text-black dark:text-white text-base">
                      {comment.content}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Yorum ve gönder view */}
          <View className="p-4 bg-white border-t border-gray-200 bg-white dark:bg-black">
            <View className="flex-row justify-between items-center rounded-lg bg-white dark:bg-black">
              <TextInput
                style={{
                  color: colorScheme === "dark" ? "white" : "black",
                }}
                className="flex-1 h-14 p-2 border border-gray-400 dark:border-white self-stretch"
                placeholder="Yorumunuzu buraya yazın..."
                placeholderTextColor={
                  colorScheme === "dark" ? "white" : "white"
                }
                value={comment}
                onChangeText={(text) => setComment(text)}
                multiline
              />
              <TouchableOpacity onPress={handleCommentSubmit}>
                <View className="h-14 w-20 bg-blue-500 flex items-center justify-center ml-2">
                  <Text className="text-white text-center">Gönder</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* Yorum ve gönderme input son */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
