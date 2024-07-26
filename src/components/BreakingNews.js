import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import xml2js from "react-native-xml2js";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

var { width, height } = Dimensions.get("window");
const BreakingNews = () => {
  const navigation = useNavigation();
  const [haberler, setHaberler] = useState([]);

  useEffect(() => {
    const fetchHaberler = async () => {
      try {
        const response = await fetch(
          "https://www.trthaber.com/xml_mobile.php?tur=xml_genel&kategori=gundem&adet=20&selectEx=yorumSay,okunmaadedi,anasayfamanset,kategorimanset"
        );
        if (!response.ok) {
          throw new Error("Veri alınamadı");
        }
        const xmlText = await response.text();

        xml2js.parseString(xmlText, (error, result) => {
          if (error) {
            throw new Error("XML dönüştürülürken bir hata oluştu");
          }
          const haberler = result.haberler.haber.map((haber) => ({
            baslik: haber.haber_manset[0],
            resim: haber.haber_resim[0],
            metni: haber.haber_metni[0],
            link: haber.haber_link[0],
            aciklama: haber.haber_aciklama[0],
            kategori: haber.haber_kategorisi[0],
            tarih: haber.haber_tarihi[0],
          }));
          setHaberler(haberler);
        });
      } catch (error) {
        console.error("Hata:", error);
      }
    };

    fetchHaberler();
  }, []);

  const handleHaberPress = (haber) => {
    navigation.navigate("HaberDetay", { haber });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleHaberPress(item)}
      style={{ marginHorizontal: 10 }}
    >
      <View style={{ width: width * 0.8, height: height * 0.22 }}>
        <Image
          source={{
            uri:
              item.resim ||
              "https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmV3c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
          }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "100%",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            {item.baslik.length > 60
              ? item.baslik.slice(0, 58) + "..."
              : item.baslik.split("-")[0] || "N/A"}
          </Text>
          <Text style={{ color: "#ccc", fontSize: 12 }}>
            {item?.kategorisi?.length > 20
              ? item.kategorisi.slice(0, 20) + "..."
              : item.kategorisi}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      data={haberler}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToAlignment="center"
      snapToInterval={width * 0.8 + 20} // Kart genişliği + öğeler arası boşluk
      contentContainerStyle={{
        paddingHorizontal: (width - width * 0.8) / 80, // İlk ve son öğeyi ortalamak için padding
      }}
      pagingEnabled
    />
  );
};

export default BreakingNews;
