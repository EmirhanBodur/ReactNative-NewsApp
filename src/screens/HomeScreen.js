import { ScrollView, View } from "react-native";
import React, { useState } from "react";
import { useColorScheme } from "nativewind";
import { useQuery } from "@tanstack/react-query";
import { fetchBreakingNews, fetchRecommendedNews } from "../../utils/NewsApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Header from "../components/Header";
import Loading from "../components/Loading";
import MiniHeader from "../components/MiniHeader";
import BreakingNews from "../components/BreakingNews";
import NewsSection from "../components/NewsSection";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const { data, isLoading: isBreakingLoading } = useQuery({
    queryKey: ["breakingNewss"],
    queryFn: fetchBreakingNews,
  });

  const { data: recommendedNew, isLoading: isRecommendedLoading } = useQuery({
    queryKey: ["recommededNewss"],
    queryFn: fetchRecommendedNews,
  });
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />
      <View>
        <Header />
        {isBreakingLoading ? (
          <Loading />
        ) : (
          <View>
            <MiniHeader label="Son Dakika Haberleri" />
            <BreakingNews label={"Breaking News"} data={data.articles} />
          </View>
        )}

        <View>
          <MiniHeader label="Haberler" />

          <ScrollView
            contentContainerStyle={{
              paddingBottom: hp(50),
            }}
          >
            {isRecommendedLoading ? (
              <Loading />
            ) : (
              <NewsSection label="Keşfet" newsProps={recommendedNew.articles} />
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
