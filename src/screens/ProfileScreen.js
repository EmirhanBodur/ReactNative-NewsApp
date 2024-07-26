import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import FeatherIcon from "react-native-vector-icons/Feather";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { db, auth, app, storage } from "./firebaseConfig";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const isBigScreen = windowWidth >= 768;

const tabs = [{ name: "Yazdığınız Haberler", icon: "newspaper-outline" }];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [value, setValue] = useState(0);
  const [secureEntry, setSecureEntry] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [userType, setUserType] = useState("");
  const [biografi, setBiografi] = useState("");
  const [website, setWebsite] = useState("");
  const [userNews, setUserNews] = useState([]);
  const [values, setValues] = useState(0);
  const [newsCount, setNewsCount] = useState("0");
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const firestore = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserInfo(userData);

            setUserType(userData.userType);

            if (userData.profilePhotoUrl) {
              setProfilePhotoUrl(userData.profilePhotoUrl);
            }

            // Kullanıcı tipini al
            setUserType(userData.userType);
          } else {
            console.log("Kullanıcı belgesi bulunamadı.");
          }
        } catch (error) {
          console.error("Kullanıcı bilgilerini alma hatası:", error);
        }
      } else {
        setUserInfo(null);
      }
    });

    const unsubscribeSnapshot = onSnapshot(
      doc(firestore, "users", auth.currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserInfo(userData);
          if (userData.profilePhotoUrl) {
            setProfilePhotoUrl(userData.profilePhotoUrl);
          }
        } else {
          console.log("Kullanıcı belgesi bulunamadı.");
        }
      }
    );

    return () => {
      unsubscribe();
      unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    const fetchUserNews = async () => {
      try {
        // Firestore bağlantısını al
        const db = getFirestore();
        // Giriş yapan kullanıcının adını ve soyadını al
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.error("Kullanıcı oturum açmamış");
          return;
        }
        const authorUid = currentUser.uid;

        // Kullanıcının adına göre haberleri filtrele
        const q = query(
          collection(db, "news"),
          where("uid", "==", authorUid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const newsData = [];
          querySnapshot.forEach((doc) => {
            // Her belgeyi al ve kullanıcı haberlerine ekle
            newsData.push({ id: doc.id, ...doc.data() });
          });
          // Kullanıcı haberlerini güncelle
          setUserNews(newsData);
          setNewsCount(newsData.length);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Haberleri getirme hatası:", error);
      }
    };
    // Kullanıcının haberlerini getir
    fetchUserNews();
  }, []);

  // userType değerine göre value değerini ayarla
  useEffect(() => {
    if (userType === "Yazar") {
      setValue(1);
    } else {
      setValue(0);
    }
  }, [userType]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const editProfile = () => {
    navigation.navigate("EditProfile");
  };

  const createNews = () => {
    navigation.navigate("Create");
  };

  const handleSettings = () => {
    navigation.navigate("SettingsScreen");
  };

  const handleButtonPress = async () => {
    try {
      if (userInfo && userInfo.website) {
        // userInfo var mı ve userInfo.website tanımlı mı kontrol ediliyor
        Linking.openURL(userInfo.website);
      } else {
        console.log("Kullanıcının web sitesi bulunamadı.");
      }
    } catch (error) {
      console.error("Web sitesi açma hatası:", error);
    }
  };

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

  const handleNewsPress = (item) => {
    navigation.navigate("NewsDetailScreen", {
      newsId: item.id,
      newsData: item,
    });
  };

  const handleEditNews = (item) => {
    navigation.navigate("EditNewsScreen", {
      newsId: item.id,
      newsData: item,
    });
  };

  const handleDeleteNews = async (newsId) => {
    try {
      // Firestore bağlantısını al
      const db = getFirestore();
      // Haberin referansını oluştur
      const newsRef = doc(db, "news", newsId);
      // Haberi sil
      await deleteDoc(newsRef);
      // Kullanıcı haberlerini güncelle
      setUserNews((prevNews) => prevNews.filter((news) => news.id !== newsId));
      // Haber sayısını güncelle
      setNewsCount((prevCount) => prevCount - 1);
      // Bilgilendirme mesajı göster
      Toast.show({
        type: "success",
        position: "top",
        text1: "Başarı",
        text2: "Haber başarıyla silinmiştir.",
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
    } catch (error) {
      console.error("Haber silme hatası:", error);
      // Hata durumunda bilgilendirme mesajı göster
      Toast.show({
        type: "error",
        position: "top",
        text1: "Hata",
        text2: "Haber Silinrken bir hata oluştu.",
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

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        className="mb-4 mx-4 space-y-1"
        onPress={() => handleNewsPress(item)}
      >
        <View className="flex-row justify-start w-[100%] shadow-sm">
          <View className="items-start justify-start w-[20%]">
            <Image
              source={{ uri: item.photoUrl }}
              style={{ width: hp(9), height: hp(10) }}
              resizeMode="cover"
              className="rounded-lg"
            />
          </View>
          <View className="w-[70%] pl-4 justify-center space-y-1 flex">
            <View className="flex gap-0.5">
              <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
                {item.category}
              </Text>

              <Text
                className="text-neutral-800 capitalize max-w-[90%] dark:text-white"
                style={{
                  fontSize: hp(1.7),
                }}
              >
                {item.title}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-white">
                {item.createdAt && formatTimeDifference(item.createdAt)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowOptions(!showOptions)}
              style={{ position: "absolute", right: -10, top: 30 }}
            >
              <Ionicons
                name="chevron-down"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>

            {showOptions && (
              <View className="flex-row">
                <View className="mt-2 flex-row ">
                  <TouchableOpacity onPress={() => handleEditNews(item)}>
                    <View className="flex-row justify-start items-center">
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color={colorScheme === "dark" ? "white" : "black"}
                      />
                      <Text className="ml-1 dark:text-neutral-300">
                        Düzenle
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteNews(item.id)}>
                    <View className="flex-row justify-start items-center">
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colorScheme === "dark" ? "white" : "black"}
                      />
                      <Text className="ml-1 dark:text-neutral-300">Sil</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // const renderItem = ({ item }) => {
  //   return (
  //     <TouchableOpacity
  //       className="mb-4 mx-4 space-y-1"
  //       onPress={() => handleNewsPress(item)}
  //     >
  //       <View className="flex-row justify-start w-[100%] shadow-sm">
  //         <View className="items-start justify-start w-[20%]">
  //           <Image
  //             source={{ uri: item.photoUrl }}
  //             style={{ width: hp(9), height: hp(10) }}
  //             resizeMode="cover"
  //             className="rounded-lg"
  //           />
  //         </View>
  //         <View className="w-[70%] pl-4 justify-center space-y-1 flex">
  //           <View className="flex gap-0.5">
  //             <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
  //               {item.category}
  //             </Text>

  //             <Text
  //               className="text-neutral-800 capitalize max-w-[90%] dark:text-white"
  //               style={{
  //                 fontSize: hp(1.7),
  //               }}
  //             >
  //               {item.title}
  //             </Text>
  //             <Text className="text-xs text-gray-500 dark:text-white">
  //               {item.createdAt && formatTimeDifference(item.createdAt)}
  //             </Text>
  //           </View>

  //           <TouchableOpacity
  //             onPress={() => setShowOptions(true)}
  //             style={{ position: "absolute", right: -10, top: 30 }}
  //           >
  //             <Ionicons name="chevron-down" size={24} color="black" />
  //           </TouchableOpacity>
  //         </View>
  //       </View>

  //       <Modal
  //         transparent={true}
  //         animationType="slide"
  //         visible={showOptions}
  //         onRequestClose={() => setShowOptions(false)}
  //       >
  //         <TouchableOpacity
  //           style={{ flex: 1 }}
  //           activeOpacity={1}
  //           onPressOut={() => setShowOptions(false)}
  //         >
  //           <View className="flex-1 justify-end items-center">
  //             <TouchableOpacity
  //               activeOpacity={1}
  //               onPress={() => {}}
  //               className="w-full bg-white p-4 rounded-t-lg"
  //             >
  //               <TouchableOpacity onPress={() => handleEditNews(item)}>
  //                 <View className="flex-row justify-start items-center mb-4">
  //                   <Ionicons name="pencil-outline" size={20} color="#4B5563" />
  //                   <Text className="ml-1 dark:text-white">Düzenle</Text>
  //                 </View>
  //               </TouchableOpacity>
  //               <TouchableOpacity onPress={() => handleDeleteNews(item.id)}>
  //                 <View className="flex-row justify-start items-center">
  //                   <Ionicons name="trash-outline" size={20} color="#4B5563" />
  //                   <Text className="ml-1 dark:text-white">Sil</Text>
  //                 </View>
  //               </TouchableOpacity>
  //             </TouchableOpacity>
  //           </View>
  //         </TouchableOpacity>
  //       </Modal>
  //     </TouchableOpacity>
  //   );
  // };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />

      <View className="flex flex-row bg-white justify-between items-center bg-white dark:bg-black  dark:text-white m-3 ">
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons
            name="arrow-back-outline"
            size={25}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-dark dark:text-white">
          Profil
        </Text>
        <TouchableOpacity onPress={handleSettings}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>

      <View className="pt-3 px-6 pb-6 bg-white  dark:bg-black">
        <View className="flex-row items-center space-x-4">
          <View className="w-32 h-32 rounded-full overflow-hidden border border-black dark:bg-white">
            {/* Profil fotoğrafını göster */}
            <Image
              source={{ uri: profilePhotoUrl }}
              className="w-full h-full"
            />
          </View>
          <View className="flex-grow flex-row justify-center items-center space-x-8">
            <View className="flex-col items-center">
              <Text className="font-bold text-black dark:text-neutral-300">
                {newsCount}
              </Text>
              <Text className="text-medium font-bold text-black dark:text-neutral-300">
                Haberler
              </Text>
            </View>
            {/* <View className="flex-col items-center">
              <Text className="font-bold text-black dark:text-neutral-300">
                0
              </Text>
              <Text className="font-bold text-black dark: text-neutral-300">
                Beğenilenler
              </Text>
            </View> */}
          </View>
        </View>
        <View className="mt-4">
          <Text className="dark:text-white font-bold">
            {userInfo?.fullName}
          </Text>
          <Text className="dark:text-white mt-2">{userInfo?.biografi}</Text>
        </View>

        <View className="flex-row space-x-2 mt-5 ">
          <TouchableOpacity onPress={editProfile} className="flex-1">
            <View className="py-2.5 px-4 flex-row items-center justify-center bg-blue-500 rounded-xl">
              <Text className="mr-2 text-base font-semibold text-white">
                Profili Düzenle
              </Text>
              <FeatherIcon color="#fff" name="edit-3" size={16} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleButtonPress} // Butona basıldığında handleButtonPress işlevini çağır
            className="flex-1"
          >
            <View className="py-2.5 px-4 flex-row items-center justify-center bg-blue-500 rounded-xl">
              <Text className="mr-2 text-base font-semibold text-white">
                Web Site
              </Text>
              <FeatherIcon color="#fff" name="globe" size={16} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row bg-white dark:bg-black">
        {tabs.map(({ name, icon }, index) => {
          const isActive = index === values;

          return (
            <View
              key={name}
              className="flex-grow flex-shrink basis-0 border-blue-400 bg-white dark:bg-black"
              style={{
                borderBottomColor: colorScheme === "dark" ? "white" : "black",
                borderBottomWidth: 2,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setValues(index);
                }}
              >
                <View className="flex-row items-center justify-center pt-4 pb-4 relative bg-white dark:bg-black">
                  <Ionicons
                    name={icon}
                    size={16}
                    color={colorScheme === "dark" ? "#FFFFFF" : "black"}
                  />

                  <Text className="text-[13px] font-semibold text-gray-500 dark:text-neutral-300 ml-2">
                    {name}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {values === 0 && userNews.length > 0 && (
        <View className="flex-1 pt-4 bg-white dark:bg-black">
          <FlatList
            data={userNews}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* {values === 1 && (
        <View>
          <Text>selam</Text>
        </View>
      )} */}

      {userType === "Yazar" && (
        <TouchableOpacity
          className="bg-blue-500 absolute justify-center items-center fixed bottom-5 right-5 w-[50px] h-[50px] rounded-full"
          onPress={createNews}
        >
          <View className="bg-blue-500 w-10 h-10 rounded-full flex justify-center items-center">
            <Ionicons name="add" size={24} color="white" />
          </View>
        </TouchableOpacity>
      )}
      <Toast />
    </SafeAreaView>
  );
}
