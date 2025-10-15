// src/screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,Button, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Icon, SearchBar, Button as RNEButton } from '@rneui/themed';
import { getMarketOverview, getWatchlist, getLatestStock, searchStocks, addToWatchlist, removeFromWatchlist } from '../api/tradeMentorApi';

const CardHeader = ({ title, iconName }) => (
  <View style={styles.cardHeader}>
    <Icon name={iconName} type="material-community" color="#FF8C00" size={24} />
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [marketData, setMarketData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const overview = await getMarketOverview();
      const list = await getWatchlist();

      // Enrich watchlist with live price and change
      const enriched = await Promise.all((list || []).map(async (item) => {
        try {
          const q = await getLatestStock(item.symbol);
          const price = q?.regularMarketPrice ?? q?.lastPrice ?? q?.price ?? q?.currentPrice ?? null;
          const changePct = q?.regularMarketChangePercent ?? q?.changePercent ?? q?.change ?? 0;
          return { ...item, price, change: changePct };
        } catch {
          return { ...item, price: null, change: 0 };
        }
      }));

      setMarketData(overview);
      setWatchlist(enriched);
      
      
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Implement a better error display in a real app
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 20000); // auto-refresh watchlist
    return () => clearInterval(id);
  }, []);

  const renderIndex = (title, value, change) => (
    <View style={styles.indexContainer}>
      <Text style={styles.indexTitle}>{title}</Text>
      <Text style={styles.indexValue}>${value}</Text>
      <Text style={[styles.indexChange, { color: change >= 0 ? '#4CAF50' : '#FF6347' }]}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change)?.toFixed(2)}%
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView 
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#FF8C00" />
      }
    >
      <Text h4 style={styles.pageTitle}>Market Snapshot</Text>

      {/* Market Overview Card */}
      <Card containerStyle={styles.card}>
        <CardHeader title="Global Indices" iconName="chart-line" />
        <View style={styles.indicesGrid}>
          {renderIndex('NIFTY', marketData?.nifty || 0, marketData?.niftyChange || 0)}
          {renderIndex('SENSEX', marketData?.sensex || 0, marketData?.sensexChange || 0)}
          {renderIndex('NASDAQ', marketData?.nasdaq || 0, marketData?.nasdaqChange || 0)}
        </View>
      </Card>

      {/* Watchlist Card */}
      <Card containerStyle={styles.card}>
        <CardHeader title="My Watchlist" iconName="eye-outline" />
        <SearchBar
          placeholder="Search stocks to add..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={async () => { try { const r = await searchStocks(query); setSearchResults(r || []); } catch { setSearchResults([]); } }}
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInputContainer}
          inputStyle={styles.searchInput}
          lightTheme={false}
        />
        {searchResults.slice(0, 5).map((res, idx) => (
          <View key={res.symbol || idx} style={styles.searchRow}>
            <Text style={styles.stockSymbol}>{res.symbol}</Text>
            <RNEButton title="Add" type="outline" buttonStyle={styles.addBtn} onPress={async () => { await addToWatchlist(res.symbol); setQuery(''); setSearchResults([]); fetchData(); }} />
          </View>
        ))}

        {watchlist.length > 0 ? (
          watchlist.map((stock, index) => (
            <View key={stock.id || stock.symbol || index} style={styles.stockRow}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('StockDetails', { symbol: stock.symbol })}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              </TouchableOpacity>
              <Text style={styles.stockPrice}>${Number(stock?.price ?? 0).toFixed(2)}</Text>
              <Text style={[styles.stockChange, { color: (stock.change ?? 0) >= 0 ? '#4CAF50' : '#FF6347' }]}>
                {(stock.change ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(Number(stock.change ?? 0)).toFixed(2)}%
              </Text>
              <RNEButton title="Remove" type="outline" buttonStyle={styles.removeBtn} onPress={async () => { await removeFromWatchlist(stock.symbol); fetchData(); }} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Watchlist is empty. Add some stocks!</Text>
        )}
      </Card>
      
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold', fontSize: 20 },
  card: { backgroundColor: '#1C1C1C', borderRadius: 16, borderWidth: 0, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 18, marginLeft: 10, fontWeight: 'bold' },
  indicesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  indexContainer: { alignItems: 'center', flex: 1, padding: 5 },
  indexTitle: { color: '#ccc', fontSize: 12, marginBottom: 3 },
  indexValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  indexChange: { fontSize: 14, fontWeight: '600' },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  stockSymbol: { color: '#fff', fontWeight: 'bold', flex: 2 },
  stockPrice: { color: '#fff', flex: 1, textAlign: 'right' },
  stockChange: { flex: 1, textAlign: 'right' },
  emptyText: { color: '#ccc', textAlign: 'center', padding: 10 },
  viewAllButton: { borderColor: '#FF8C00', marginTop: 10, borderRadius: 8 },
  viewAllTitle: { color: '#FF8C00' },
  searchContainer: { backgroundColor: '#1C1C1C', borderBottomColor: 'transparent', borderTopColor: 'transparent', paddingHorizontal: 0, marginBottom: 8 },
  searchInputContainer: { backgroundColor: '#111', borderRadius: 8 },
  searchInput: { color: '#fff' },
  searchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  addBtn: { borderRadius: 8, borderColor: '#4CAF50' },
  removeBtn: { borderRadius: 8, borderColor: '#FF6347', marginLeft: 8 },
});

export default HomeScreen;