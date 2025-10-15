// src/screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,Button } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getMarketOverview, getWatchlist } from '../api/tradeMentorApi';

const CardHeader = ({ title, iconName }) => (
  <View style={styles.cardHeader}>
    <Icon name={iconName} type="material-community" color="#FF8C00" size={24} />
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const HomeScreen = () => {
  const [marketData, setMarketData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const overview = await getMarketOverview();
      const list = await getWatchlist();
      
      setMarketData(overview);
      setWatchlist(list);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Implement a better error display in a real app
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    <ScrollView 
      style={styles.container}
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
        {watchlist.length > 0 ? (
          watchlist.slice(0, 3).map((stock, index) => (
            <View key={index} style={styles.stockRow}>
              <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              <Text style={styles.stockPrice}>${stock?.price?.toFixed(2)}</Text>
              <Text style={[styles.stockChange, { color: stock.change >= 0 ? '#4CAF50' : '#FF6347' }]}>
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Watchlist is empty. Add some stocks!</Text>
        )}
        <Button
          title="View All"
          type="outline"
          buttonStyle={styles.viewAllButton}
          titleStyle={styles.viewAllTitle}
        />
      </Card>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold' },
  card: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 15, marginBottom: 15 },
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
});

export default HomeScreen;