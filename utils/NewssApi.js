import axios from "axios";

export const fetchSearchNews = async (kategori, searchTerm) => {
  try {
    const response = await axios.get(
      `http://www.trthaber.com/xml_mobile.php?tur=xml_genel&kategori=${kategori}&adet=20&selectEx=yorumSay,okunmaadedi,anasayfamanset,kategorimanset&q=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching search news:", error);
    throw error;
  }
};
