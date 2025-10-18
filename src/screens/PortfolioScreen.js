// src/screens/PortfolioScreen.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Button, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';   // ✅ ADD THIS
import { getPortfolioSummary, placeOrder } from '../api/tradeMentorApi';

// Dummy component for the chart placeholder
const PortfolioChart = ({ data }) => {
  const isPositive = data.totalGain > 0;
  const color = isPositive ? '#4CAF50' : '#FF6347';

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>7-Day Performance</Text>
      <View
        style={{
          height: 150,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: color,
          borderRadius: 8,
        }}
      >
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
  const navigation = useNavigation(); // ✅ FIX: define navigation hook

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellVisible, setSellVisible] = useState(false);
  const [sellSymbol, setSellSymbol] = useState('');
  const [sellQty, setSellQty] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await getPortfolioSummary();
      const investedValue = data.holdings.reduce((sum, h) => sum + h.avgBuyPrice * h.qty, 0);
      const totalGain = data.totalPortfolioValue - investedValue;

      setSummary({
        totalValue: data.totalPortfolioValue,
        totalGain,
        todayGain: data.todayGain ?? 0,
        cashBalance: data.cashBalance ?? 0,
        holdings:
          data.holdings?.map((h) => ({
            symbol: h.symbol,
            quantity: h.qty,
            price: h.currentPrice,
            gain: h.pnlAbs,
          })) || [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchSummary);
    fetchSummary();
    return unsubscribe;
  }, [navigation]);

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
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
          <View style={[styles.gainRow, { marginTop: 8 }]}>
            <Text style={styles.summaryLabel}>Cash Balance:</Text>
            <Text style={styles.gainText}>${(summary?.cashBalance || 0).toFixed(2)}</Text>
          </View>
        </Card>

        {/* Holdings Card */}
        <Card containerStyle={styles.holdingsCard}>
          <Text style={styles.holdingsTitle}>Current Holdings</Text>
          {(summary?.holdings || []).map((h, index) => (
            <View key={h.id || h.symbol || index} style={styles.holdingRow}>
              <Text style={styles.holdingSymbol}>{h.symbol}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.holdingPrice}>${Number(h.price ?? 0).toFixed(2)}</Text>
                <Text
                  style={[
                    styles.holdingGain,
                    { color: h.gain >= 0 ? '#4CAF50' : '#FF6347' },
                  ]}
                >
                  {h.quantity} Shares @ ${Number(h.price ?? 0).toFixed(2)} (P&L $
                  {Number(h.gain ?? 0).toFixed(2)})
                </Text>
                <Button
                  title="Sell"
                  type="outline"
                  buttonStyle={{ marginTop: 8, borderRadius: 8 }}
                  onPress={() => {
                    setSellSymbol(h.symbol);
                    setSellQty(String(h.quantity || 1));
                    setSellVisible(true);
                  }}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Sell Modal */}
        <Modal
          visible={sellVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSellVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <Card containerStyle={{ backgroundColor: '#1C1C1C', borderRadius: 16 }}>
              <Text h4 style={{ color: '#FF8C00' }}>Sell {sellSymbol}</Text>
              <Text style={{ color: '#ccc', marginBottom: 8 }}>Quantity</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#111',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                }}
              >
                <TextInput
                  style={{ color: '#fff', flex: 1 }}
                  value={sellQty}
                  onChangeText={setSellQty}
                  keyboardType="numeric"
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 12,
                }}
              >
                <Button
                  title="Cancel"
                  type="outline"
                  onPress={() => setSellVisible(false)}
                  buttonStyle={{ borderRadius: 8 }}
                />
                <Button
                  title="Place Sell"
                  onPress={async () => {
                    try {
                      await placeOrder({
                        symbol: sellSymbol,
                        type: 'MARKET_SELL',
                        qty: Number(sellQty),
                      });
                      setSellVisible(false);
                      await fetchSummary(); // ✅ Refresh after sell
                    } catch (e) {
                      console.error('Sell failed', e);
                    }
                  }}
                  buttonStyle={{ borderRadius: 8 }}
                />
              </View>
            </Card>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold', fontSize: 20 },
  summaryCard: { backgroundColor: '#1C1C1C', borderRadius: 16, borderWidth: 0, padding: 20, marginBottom: 16 },
  summaryLabel: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  totalValueText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  gainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  gainText: { fontSize: 18, fontWeight: 'bold' },
  chartContainer: { padding: 10, marginHorizontal: 10, marginBottom: 15 },
  chartTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  holdingsCard: { backgroundColor: '#1C1C1C', borderRadius: 16, borderWidth: 0, padding: 16, marginBottom: 16 },
  holdingsTitle: { color: '#FF8C00', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  holdingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  holdingSymbol: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  holdingPrice: { color: '#fff', fontSize: 16 },
  holdingGain: { fontSize: 12 },
});

export default PortfolioScreen;
