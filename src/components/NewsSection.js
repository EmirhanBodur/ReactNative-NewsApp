import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import axios from "axios";
import xml2js from "react-native-xml2js";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import CategoryBar from "./CategoryBar";

export default function NewsSection() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [bookmarkStatus, setBookmarkStatus] = useState({});
  const [activeCategory, setActiveCategory] = useState("gundem");

  const handleCategoryChange = async (category) => {
    setActiveCategory(category); // Update active category
    try {
      const response = await axios.get(
        `https://www.trthaber.com/xml_mobile.php?tur=xml_genel&kategori=${category}&adet=20&selectEx=yorumSay,okunmaadedi,anasayfamanset,kategorimanset`
      );

      xml2js.parseString(response.data, (err, result) => {
        if (err) {
          console.error("XML ayrıştırılırken hata oluştu:", err);
          return;
        }

        const parsedNews = result.haberler.haber.map((haber) => ({
          baslik: haber.haber_manset[0],
          resim: haber.haber_resim[0],
          metni: haber.haber_metni[0],
          link: haber.haber_link[0],
          aciklama: haber.haber_aciklama[0],
          kategori: haber.haber_kategorisi[0],
          tarih: haber.haber_tarihi[0],
        }));
        setNews(parsedNews);
      });
    } catch (error) {
      console.error("Haber getirme hatası:", error);
    }
  };

  const toggleBookmarkAndSave = async (link, index) => {
    try {
      const savedArticles = await AsyncStorage.getItem("savedArticles");
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];

      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.link === link
      );

      if (!isArticleBookmarked) {
        savedArticlesArray.push(news[index]); // news kullanılıyor
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(savedArticlesArray)
        );
        const updatedStatus = { ...bookmarkStatus };
        updatedStatus[link] = true;
        setBookmarkStatus(updatedStatus);
      } else {
        const updatedSavedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.link !== link
        );
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(updatedSavedArticlesArray)
        );
        const updatedStatus = { ...bookmarkStatus };
        updatedStatus[link] = false;
        setBookmarkStatus(updatedStatus);
      }
    } catch (error) {
      console.log("Error Saving/Removing Article", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadSavedArticles = async () => {
        try {
          const savedArticles = await AsyncStorage.getItem("savedArticles");
          const savedArticlesArray = savedArticles
            ? JSON.parse(savedArticles)
            : [];

          const bookmarkDurum = {};
          savedArticlesArray.forEach((article) => {
            bookmarkDurum[article.link] = true;
          });
          setBookmarkStatus(bookmarkDurum);
        } catch (error) {
          console.log("Error Loading Saved Articles", error);
        }
      };

      loadSavedArticles();
    }, [])
  );

  useEffect(() => {
    // Load the default category (Gündem) on component mount
    handleCategoryChange(activeCategory);
  }, []);

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

  const handleHaberPress = (haber) => {
    navigation.navigate("HaberDetay", { haber });
  };

  const categories = [
    { id: 1, name: "Spor", title: "Spor" },
    { id: 2, name: "Gündem", title: "Gündem" },
    { id: 3, name: "Ekonomi", title: "Ekonomi" },
    { id: 4, name: "Dünya", title: "dunya" },
    { id: 5, name: "Sağlık", title: "saglik" },
    { id: 6, name: "Yaşam", title: "Yaşam" },
    { id: 7, name: "Kültür Sanat", title: "kultur-sanat" },
    { id: 8, name: "Eğitim", title: "egitim" },
  ];

  return (
    <View>
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />
      <View>
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onPressCategory={handleCategoryChange}
        />

        {/* Buraya boşluk ekleyen View */}
        <View style={{ marginBottom: hp(2) }} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingBottom: 295 }}>
            {news.map((item, index) => (
              <View key={index} className="mb-4 mx-4 space-y-1">
                <TouchableOpacity
                  onPress={() => handleHaberPress(item)}
                  key={index}
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
                        {item.baslik.length > 60
                          ? item.baslik.slice(0, 58) + "..."
                          : item.baslik.split("-")[0] || "N/A"}
                      </Text>
                      <Text className="text-xs text-gray-700 dark:text-neutral-300">
                        {formatDate(item.tarih)}
                      </Text>
                    </View>
                    <View className="w-[10%] justify-center">
                      <TouchableOpacity
                        onPress={() => toggleBookmarkAndSave(item.link, index)}
                      >
                        <BookmarkSquareIcon
                          color={bookmarkStatus[item.link] ? "green" : "gray"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
