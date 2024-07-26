import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Share,
} from "react-native";
import HTML from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

const HaberDetayEkrani = ({ route = {}, navigation = {} }) => {
  const { haber } = route.params || {};
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const isDarkMode = colorScheme === "dark";

  const windowWidth = useWindowDimensions().width;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${haber.baslik}\n\n${haber.aciklama}\n\n${haber.metni}`,
        // Opsiyonel: URL eklemek isterseniz
        // url: haber.url,
      });
    } catch (error) {
      console.error("Paylaşma işlemi başarısız oldu:", error.message);
    }
  };

  const handleComment = () => {
    navigation.navigate("Comment", { newsId });
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
            <View className="flex-row space-x-2 items-center bg-white dark:bg-black">
              <View className="h-4 w-8 bg-gray-300 rounded-full bg-white dark:bg-black"></View>
              <View className="h-4 w-4 bg-gray-300 rounded-full bg-white dark:bg-black"></View>
            </View>
            {/* <TouchableOpacity onPress={handleShare}>
              <FontAwesome name="share-alt" size={24} color="gray" />
            </TouchableOpacity> */}
          </View>
          <View className="rounded-lg overflow-hidden bg-white dark:bg-black">
            <Image
              source={{
                uri: haber.resim,
              }}
              className="w-full h-80"
            />
            <View className="py-4 bg-white dark:bg-black">
              <Text className="text-xl font-bold text-black dark:text-white">
                {haber.baslik}
              </Text>
              <View className="flex-row justify-between mt-4 bg-white dark:bg-black">
                <Text className="font-bold text-black dark:text-white">
                  {haber.kategori}
                </Text>
                <Text className="text-gray-500 font-bold text-l text-black dark:text-white">
                  {formatDate(haber.tarih)}
                </Text>
              </View>
              <Text className="text-base text-black dark:text-white mt-3">
                {haber.aciklama}
              </Text>

              <HTML
                source={{ html: haber.metni }}
                contentWidth={windowWidth}
                tagsStyles={{
                  p: {
                    fontSize: 15,
                    lineHeight: 24,
                    color: isDarkMode ? "#ccc" : "#333",
                    marginBottom: -7,
                  },
                  h1: {
                    fontSize: 24,
                    fontWeight: "bold",
                    color: isDarkMode ? "#fff" : "black",
                  },
                  a: {
                    color: isDarkMode ? "white" : "black",
                    textDecoration: "none",
                  },
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HaberDetayEkrani;
