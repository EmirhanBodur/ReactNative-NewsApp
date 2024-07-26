import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { Image as ExpoImage } from "expo-image"; // expo-image kullanımı
import { db } from "./firebaseConfig";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useColorScheme } from "nativewind";

const NewsScreen = () => {
  const { colorScheme } = useColorScheme();
  const [newsList, setNewsList] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    fetchInitialNews();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const fetchInitialNews = async () => {
    setLoading(true);
    try {
      const newsCollectionRef = collection(db, "news");
      const q = query(
        newsCollectionRef,
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedNewsList = snapshot.docs.map((doc) => {
            const newsData = doc.data();
            const createdAtString = newsData.createdAt
              ? new Date(newsData.createdAt).toISOString()
              : null;
            return { id: doc.id, ...newsData, createdAt: createdAtString };
          });
          setNewsList(fetchedNewsList);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching news:", error);
          setLoading(false);
        }
      );
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("Error fetching news:", error);
      setLoading(false);
    }
  };

  const fetchMoreNews = async () => {
    if (!lastVisible || loading) return;
    setLoading(true);
    try {
      const newsCollectionRef = collection(db, "news");
      const q = query(
        newsCollectionRef,
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(10)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedNewsList = snapshot.docs.map((doc) => {
            const newsData = doc.data();
            const createdAtString = newsData.createdAt
              ? new Date(newsData.createdAt).toISOString()
              : null;
            return { id: doc.id, ...newsData, createdAt: createdAtString };
          });
          setNewsList((prevNewsList) => [...prevNewsList, ...fetchedNewsList]);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching news:", error);
          setLoading(false);
        }
      );
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("Error fetching news:", error);
      setLoading(false);
    }
  };

  const formatTimeDifference = (createdAt) => {
    const currentTime = new Date();
    const diffMilliseconds = currentTime - new Date(createdAt);
    const diffSeconds = Math.floor(diffMilliseconds / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);

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

  const handleNewsPress = (item) => {
    navigation.navigate("NewsDetailScreen", {
      newsId: item.id,
      newsData: item,
    });
  };

  const renderNewsItem = ({ item, index }) => (
    <View key={index} className="mb-2 space-y-1">
      <TouchableOpacity
        className="mb-4 mx-4 space-y-1"
        onPress={() => handleNewsPress(item)}
      >
        <View className="flex-row justify-start w-[100%] shadow-sm">
          <View className="items-start justify-start w-[20%]">
            <ExpoImage
              source={{
                uri: item.photoUrl || "https://via.placeholder.com/150",
              }}
              style={{ width: hp(9), height: hp(10) }}
              resizeMode="cover"
              className="rounded-lg"
              cachePolicy="disk" // Cache politikası
            />
          </View>
          <View className="w-[70%] pl-4 justify-center space-y-1 flex">
            <View className="flex">
              <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
                {item.category}
              </Text>
            </View>
            <View className="flex">
              <Text
                className="text-neutral-800 capitalize max-w-[90%] dark:text-white"
                style={{ fontSize: hp(1.7) }}
              >
                {item.title.length > 60
                  ? item.title.slice(0, 58) + "..."
                  : item.title.split("-")[0] || "N/A"}
              </Text>
            </View>
            <View className="flex">
              <Text className="text-xs text-gray-700 dark:text-neutral-300">
                {item.createdAt && formatTimeDifference(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="p-4">
        <Text className="font-bold text-2xl text-black dark:text-neutral-300">
          Yazar Haberleri
        </Text>
      </View>
      <FlatList
        data={newsList}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4"
        onEndReached={fetchMoreNews}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && <ActivityIndicator size="large" color="#0000ff" />
        }
      />
    </SafeAreaView>
  );
};

export default NewsScreen;
