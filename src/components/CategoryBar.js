import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";

export default function CategoryBar({
  categories,
  activeCategory,
  onPressCategory,
}) {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => onPressCategory(category.title.toLowerCase())}
          style={{
            marginRight: 20,
            paddingBottom: 5,
            marginLeft: 20,
            borderBottomWidth:
              activeCategory === category.title.toLowerCase() ? 2 : 0,
            borderBottomColor:
              activeCategory === category.title.toLowerCase()
                ? "#1E90FF"
                : "transparent",
          }}
        >
          <Text
            style={{
              color:
                activeCategory === category.title.toLowerCase()
                  ? "#1E90FF"
                  : colorScheme === "dark"
                  ? "#edf2f7"
                  : "#2d3748",
              fontWeight:
                activeCategory === category.title.toLowerCase()
                  ? "bold"
                  : "normal",
            }}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
