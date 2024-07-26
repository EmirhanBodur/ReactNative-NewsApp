import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { db } from "./firebaseConfig";
import { useColorScheme } from "nativewind";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";

const NewsDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const { newsId, newsData } = route.params;

  const formatTimeDifference = (createdAt) => {
    const currentTime = new Date();
    const diffMilliseconds = currentTime - new Date(createdAt);
    const diffSeconds = Math.floor(diffMilliseconds / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30); // Yaklaşık olarak bir ay olarak kabul edilebilir

    if (diffMonths > 0) {
      return `${diffMonths} ay önce`;
    } else if (diffDays > 0) {
      return `${diffDays} gün önce`;
    } else if (diffHours > 0) {
      return `${diffHours} saat önce`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} dakika önce`;
    } else {
      return "şimdi";
    }
  };

  useEffect(() => {
    const newsDocRef = doc(db, "news", newsId);

    const unsubscribeLikes = onSnapshot(newsDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLikes(data.likes ?? 0);
      }
    });

    const commentsCollectionRef = collection(db, "comments");
    const unsubscribeComments = onSnapshot(
      query(commentsCollectionRef, where("newsId", "==", newsId)),
      (snapshot) => {
        setCommentsCount(snapshot.size);
      }
    );

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [newsId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = () => {
    console.log("Paylaşmaya hazır.");
  };

  const handleComment = () => {
    navigation.navigate("Comment", { newsId });
  };

  const toggleHeart = async () => {
    let newLikes = likes;

    if (isHeartPressed) {
      if (newLikes > 0) {
        newLikes -= 1;
      }
    } else {
      newLikes += 1;
    }

    setIsHeartPressed(!isHeartPressed);
    setLikes(newLikes);

    const newsDocRef = doc(db, "news", newsId);
    await updateDoc(newsDocRef, {
      likes: newLikes,
    });
  };

  // Icon rengi
  const iconColor = isHeartPressed
    ? "red"
    : colorScheme === "dark"
    ? "white"
    : "black";

  // Kenar çizgisi rengi
  const borderColor = colorScheme === "dark" ? "white" : "black";

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView>
        <View className="p-4 bg-white dark:bg-black">
          <View className="flex-row items-center justify-between mb-4 bg-white dark:bg-black">
            <TouchableOpacity onPress={handleBack}>
              <FontAwesome
                name="arrow-left"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            {/* <View className="flex-row space-x-2 items-center bg-white">
              <View className="h-4 w-8 bg-gray-300 rounded-full"></View>
              <View className="h-4 w-4 bg-gray-300 rounded-full"></View>
            </View>
             <TouchableOpacity onPress={handleShare}>
              <FontAwesome name="share-alt" size={24} color="gray" />
            </TouchableOpacity>  */}
          </View>
          <View className="rounded-lg overflow-hidden bg-white dark:bg-black">
            <Image
              source={{
                uri: newsData.photoUrl,
              }}
              className="w-full h-80"
            />
            <View className="py-4 bg-white dark:bg-black">
              <Text className="text-xl font-bold text-black dark:text-white">
                {newsData.title}
              </Text>
              <View className="flex-row justify-between mt-4 bg-white dark:bg-black">
                <View className="flex-row items-center bg-white dark:bg-black">
                  <FontAwesome
                    name="pencil"
                    size={16}
                    color={colorScheme === "dark" ? "white" : "black"}
                    style={{ marginRight: 5 }}
                  />
                  <Text className="font-bold text-black dark:text-white">
                    {newsData.authorName}
                  </Text>
                </View>
                <Text className="text-gray-500 font-bold text-l text-black dark:text-white">
                  {formatTimeDifference(newsData.createdAt)}
                </Text>
              </View>
              <Text
                className="font-xl mt-4 text-black dark:text-white"
                style={{ lineHeight: 21 }}
              >
                {newsData.details}
              </Text>

              <View className="flex-row items-center justify-between mt-4 bg-white dark:bg-black">
                <View className="flex-row items-center space-x-1 bg-white dark:bg-black">
                  <TouchableOpacity onPress={toggleHeart}>
                    <FontAwesome
                      name={isHeartPressed ? "heart" : "heart-o"}
                      size={24}
                      color={iconColor}
                      iconStyle={{ borderColor }}
                    />
                  </TouchableOpacity>
                  <Text className="text-black dark:text-white">{likes}</Text>
                </View>
                <View className="flex-row items-center space-x-1">
                  <TouchableOpacity onPress={handleComment}>
                    <FontAwesome
                      name="comment-o"
                      size={24}
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                  </TouchableOpacity>
                  <Text className="text-black dark:text-white">
                    {commentsCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default NewsDetailScreen;
