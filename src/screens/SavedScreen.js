import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

const SavedScreen = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const navigation = useNavigation();
  const [savedArticles, setSavedArticles] = useState([]);
  const [bookmarkStatus, setBookmarkStatus] = useState([]);
  const [urlList, setUrlList] = useState([]);

  const handleClick = (item) => {
    navigation.navigate("HaberDetay", { haber: item }); // "HaberDetay" ekranına "haber" parametresini ileterek yönlendirme yapılıyor
  };

  useEffect(() => {
    const urls = savedArticles.map((item) => item.url);
    setUrlList(urls);
  }, [savedArticles]);

  const toggleBookmarkAndSave = async (item, index) => {
    try {
      const savedArticles = await AsyncStorage.getItem("savedArticles");
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];

      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.url === item.url
      );

      if (!isArticleBookmarked) {
        savedArticlesArray.push(item);
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(savedArticlesArray)
        );
        const updatedStatus = [...bookmarkStatus];
        updatedStatus[index] = true;
        setBookmarkStatus(updatedStatus);
      } else {
        const updatedSavedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.url !== item.url
        );
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(updatedSavedArticlesArray)
        );
        const updatedStatus = [...bookmarkStatus];
        updatedStatus[index] = false;
        setBookmarkStatus(updatedStatus);
      }
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      const loadSavedArticles = async () => {
        try {
          const savedArticles = await AsyncStorage.getItem("savedArticles");
          const savedArticlesArray = savedArticles
            ? JSON.parse(savedArticles)
            : [];

          setSavedArticles(savedArticlesArray);
        } catch (error) {}
      };

      loadSavedArticles();
    }, [navigation, urlList])
  );

  const clearSavedArticles = async () => {
    try {
      await AsyncStorage.removeItem("savedArticles");
      setSavedArticles([]);
      console.log("Kaydedilen Haberler Silinmiştir.");
    } catch (error) {}
  };

  const formatDate = (dateString) => {
    const dateParts = dateString.split(" ");
    const date = dateParts[1].split("-");
    const time = dateParts[2].split(":");

    const formattedDate = new Date(
      Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2])
    );

    if (isNaN(formattedDate)) {
      return "Geçersiz Tarih";
    }

    return formattedDate.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        className="mb-4 space-y-1 "
        key={index}
        onPress={() => handleClick(item)}
      >
        <View className="flex-row justify-start w-[100%] shadow-sm">
          <View className="items-start justify-start w-[20%]">
            <Image
              source={{ uri: item.resim }}
              style={{ width: hp(9), height: hp(10) }}
              resizeMode="cover"
              className="rounded-lg"
            />
          </View>

          <View className="w-[70%] pl-4 justify-center space-y-1">
            <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
              {item.kategori}
            </Text>

            <Text
              className="text-neutral-800 capitalize max-w-[90%] dark:text-white "
              style={{
                fontSize: hp(1.7),
              }}
            >
              {item.baslik}
            </Text>

            <Text className="text-xs text-gray-700 dark:text-neutral-300">
              {formatDate(item.tarih)}
            </Text>
          </View>

          <View className="w-[10%] justify-center">
            <TouchableOpacity
              onPress={() => toggleBookmarkAndSave(item, index)}
            >
              <BookmarkSquareIcon
                color={bookmarkStatus[item.link] ? "green" : "gray"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView className="p-4 bg-white flex-1 dark:bg-neutral-900">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View className="flex-row justify-between items-center">
        <Text className="font-bold text-xl text-black dark:text-white">
          Kaydedilen Haberler
        </Text>
        <TouchableOpacity
          className="bg-blue-800 py-3 px-4 rounded-lg"
          onPress={clearSavedArticles}
        >
          <Text className="text-white dark:text-white">Temizle</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginVertical: hp(2) }} className="space-y-2">
        <FlatList
          data={savedArticles}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.link}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: hp(2),
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default SavedScreen;
