// src/screens/NewsScreen.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Linking,Button } from 'react-native';
import { Text, Card, SearchBar } from '@rneui/themed';
import { getNews } from '../api/tradeMentorApi';


const NewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchNewsData = async (query = '') => {
    setLoading(true);
    try {
      // Assuming getNews returns an array of news articles
      const data = await getNews(1, 20, query);
      setNews(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  const handleSearch = () => {
    fetchNewsData(search);
  };

  const renderNewsItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      {item.imageUrl && (
        <Card.Image 
          source={{ uri: item.imageUrl }} 
          style={styles.cardImage} 
          resizeMode="cover"
        />
      )}
      <Card.Title style={styles.cardTitle}>{item.title || 'No Title'}</Card.Title>
      <Text style={styles.cardSource}>Source: {item.source || 'Unknown'}</Text>
      <Text style={styles.cardSnippet} numberOfLines={3}>{item.snippet || 'No summary available.'}</Text>
      <Button
        title="Read Full Story"
        type="outline"
        buttonStyle={styles.readMoreButton}
        titleStyle={styles.readMoreTitle}
        onPress={() => item.url && Linking.openURL(item.url)}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text h4 style={styles.pageTitle}>Top Financial News</Text>
      
      <SearchBar
        placeholder="Search headlines..."
        onChangeText={setSearch}
        value={search}
        onSubmitEditing={handleSearch}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        lightTheme={false} // Force dark mode styling
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No news articles found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold' },
  searchContainer: { backgroundColor: '#000', borderBottomColor: 'transparent', borderTopColor: 'transparent', paddingHorizontal: 0 },
  searchInputContainer: { backgroundColor: '#1C1C1C', borderRadius: 8 },
  searchInput: { color: '#fff' },
  card: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 15, marginBottom: 15 },
  cardImage: { height: 150, borderRadius: 8, marginBottom: 10 },
  cardTitle: { color: '#FF8C00', fontSize: 18, fontWeight: 'bold', textAlign: 'left', marginBottom: 5 },
  cardSource: { color: '#ccc', fontSize: 12, marginBottom: 8 },
  cardSnippet: { color: '#fff', fontSize: 14, marginBottom: 15 },
  readMoreButton: { borderColor: '#FF8C00', marginTop: 10, borderRadius: 8 },
  readMoreTitle: { color: '#FF8C00' },
  emptyText: { color: '#ccc', textAlign: 'center', padding: 20 },
});

export default NewsScreen;