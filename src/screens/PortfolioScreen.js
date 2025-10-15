// src/screens/PortfolioScreen.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator,Button  } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getPortfolioSummary } from '../api/tradeMentorApi';


// Dummy component for the chart placeholder
const PortfolioChart = ({ data }) => {
  const isPositive = data.totalGain > 0;
  const color = isPositive ? '#4CAF50' : '#FF6347';

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>7-Day Performance</Text>
      <View style={{ height: 150, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: color, borderRadius: 8 }}>
        <Text style={{ color: color, fontSize: 16 }}>
          [Placeholder for Chart Library]
        </Text>
        <Text style={{ color: color, fontSize: 14 }}>
          {isPositive ? 'Market Up 📈' : 'Market Down 📉'}
        </Text>
      </View>
    </View>
  );
};

const PortfolioScreen = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        // Mock data structure, replace with actual API call
        const data = await getPortfolioSummary();
        setSummary(data || {
          totalValue: 55000.75,
          totalGain: 2150.22,
          todayGain: -150.50,
          holdings: [
            { symbol: 'APPL', quantity: 10, price: 175.50, gain: 500.00 },
            { symbol: 'TSLA', quantity: 5, price: 900.00, gain: 1000.00 },
          ]
        });
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  const isPositive = summary?.totalGain >= 0;
  const gainColor = isPositive ? '#4CAF50' : '#FF6347';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text h4 style={styles.pageTitle}>My Portfolio</Text>

      {/* Summary Card */}
      <Card containerStyle={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
        <Text style={styles.totalValueText}>
          ${summary?.totalValue?.toFixed(2) || '0.00'}
        </Text>
        <View style={styles.gainRow}>
          <Text style={styles.summaryLabel}>Total Gain/Loss:</Text>
          <Text style={[styles.gainText, { color: gainColor }]}>
            {isPositive ? '▲' : '▼'} ${Math.abs(summary?.totalGain || 0)?.toFixed(2)}
          </Text>
        </View>
      </Card>

      {/* Chart */}
      {summary && <PortfolioChart data={summary} />}

      {/* Holdings Card */}
      <Card containerStyle={styles.holdingsCard}>
        <Text style={styles.holdingsTitle}>Current Holdings</Text>
        {(summary?.holdings || []).map((h, index) => (
          <View key={index} style={styles.holdingRow}>
            <Text style={styles.holdingSymbol}>{h.symbol}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.holdingPrice}>${h.price?.toFixed(2)}</Text>
              <Text style={[styles.holdingGain, { color: h.gain >= 0 ? '#4CAF50' : '#FF6347' }]}>
                {h.quantity} Shares ( ${h.gain?.toFixed(2)} )
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 20, marginBottom: 15 },
  summaryLabel: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  totalValueText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  gainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  gainText: { fontSize: 18, fontWeight: 'bold' },
  chartContainer: { padding: 10, marginHorizontal: 10, marginBottom: 15 },
  chartTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  holdingsCard: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 15, marginBottom: 15 },
  holdingsTitle: { color: '#FF8C00', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  holdingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  holdingSymbol: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  holdingPrice: { color: '#fff', fontSize: 16 },
  holdingGain: { fontSize: 12 },
});

export default PortfolioScreen;