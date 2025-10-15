// src/screens/StockDetailsScreen.js

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, Input } from '@rneui/themed';
import { getCompanyInfo, getLatestStock, getStockHistory, addToWatchlist, removeFromWatchlist, placeOrder } from '../api/tradeMentorApi';

// Simple candlestick using a minimal render; replace with a chart lib later
const Candle = ({ o, h, l, c }) => {
  const up = c >= o;
  const color = up ? '#4CAF50' : '#FF6347';
  const bodyHeight = Math.max(2, Math.abs(c - o));
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 2 }}>
      <View style={{ width: 2, height: Math.max(4, Math.abs(h - l)), backgroundColor: color }} />
      <View style={{ width: 8, height: bodyHeight, backgroundColor: color, marginTop: 2 }} />
    </View>
  );
};

const StockDetailsScreen = ({ route }) => {
  const { symbol } = route.params;
  const [company, setCompany] = useState(null);
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [buyVisible, setBuyVisible] = useState(false);
  const [orderType, setOrderType] = useState('MARKET_BUY');
  const [qty, setQty] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [c, q, h] = await Promise.all([
        getCompanyInfo(symbol),
        getLatestStock(symbol),
        getStockHistory(symbol),
      ]);
      setCompany(c);
      // Normalize quote fields across possible shapes (quote, data, result[0])
      const src = q?.quote || q?.data || (Array.isArray(q?.result) ? q.result[0] : undefined) || q;
      const normalizedQuote = {
        regularMarketPrice: src?.regularMarketPrice ?? src?.lastPrice ?? src?.price ?? src?.currentPrice ?? null,
        regularMarketOpen: src?.regularMarketOpen ?? src?.openPrice ?? null,
        regularMarketDayHigh: src?.regularMarketDayHigh ?? src?.highPrice ?? null,
        regularMarketDayLow: src?.regularMarketDayLow ?? src?.lowPrice ?? null,
      };
      setQuote(normalizedQuote);
      // Normalize candles: expect array of objects with open/high/low/close or o/h/l/c
      const raw = Array.isArray(h) ? h : (h?.data || []);
      const candles = raw.map(x => ({
        open: x.open ?? x.o,
        high: x.high ?? x.h,
        low: x.low ?? x.l,
        close: x.close ?? x.c,
      })).filter(x => x.open != null && x.high != null && x.low != null && x.close != null);
      setHistory(candles);

      // If O/H/L are missing from quote, derive from latest candle
      if (!normalizedQuote.regularMarketOpen && candles.length) {
        const last = candles[candles.length - 1];
        setQuote(prev => ({
          ...prev,
          regularMarketOpen: prev?.regularMarketOpen ?? last.open,
          regularMarketDayHigh: prev?.regularMarketDayHigh ?? last.high,
          regularMarketDayLow: prev?.regularMarketDayLow ?? last.low,
          regularMarketPrice: prev?.regularMarketPrice ?? last.close,
        }));
      }
    } catch (e) {
      console.error('Failed loading stock details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
    const id = setInterval(load, 15000); // poll every 15s for a simple realtime effect
    return () => clearInterval(id);
  }, [symbol]);

  const onAdd = async () => {
    setActionLoading(true);
    try {
      await addToWatchlist(symbol);
      Alert.alert('Watchlist', `${symbol} added to watchlist`);
    } catch (e) {
      Alert.alert('Error', 'Could not add to watchlist');
    } finally {
      setActionLoading(false);
    }
  };

  const onRemove = async () => {
    setActionLoading(true);
    try {
      await removeFromWatchlist(symbol);
      Alert.alert('Watchlist', `${symbol} removed from watchlist`);
    } catch (e) {
      Alert.alert('Error', 'Could not remove from watchlist');
    } finally {
      setActionLoading(false);
    }
  };

  const submitBuy = async () => {
    setActionLoading(true);
    try {
      const payload = { symbol, type: orderType, qty: Number(qty) };
      if (orderType === 'BUY' && limitPrice) payload.price = Number(limitPrice);
      await placeOrder(payload);
      setBuyVisible(false);
      Alert.alert('Order', 'Order placed successfully');
    } catch (e) {
      Alert.alert('Error', 'Could not place order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
      <Card containerStyle={styles.card}>
        <Text h4 style={styles.title}>{company?.companyName || symbol}</Text>
        <Text style={styles.meta}>{company?.sector} • {company?.industry}</Text>
        <Text style={styles.desc}>{company?.description}</Text>
      </Card>

      <Card containerStyle={styles.card}>
        <Text style={styles.section}>Price</Text>
        <Text style={styles.price}>₹{Number(quote?.regularMarketPrice || 0).toFixed(2)}</Text>
        <View style={styles.row}>
          <Text style={styles.kv}>Open: {quote?.regularMarketOpen ?? '-'} </Text>
          <Text style={styles.kv}>High: {quote?.regularMarketDayHigh ?? '-'} </Text>
          <Text style={styles.kv}>Low: {quote?.regularMarketDayLow ?? '-'} </Text>
        </View>
        <View style={styles.actionsRow}>
          <Button title="Buy" onPress={() => setBuyVisible(true)} loading={actionLoading} buttonStyle={styles.primaryBtn} />
          <Button title="Remove" type="outline" onPress={onRemove} loading={actionLoading} buttonStyle={styles.secondaryBtn} />
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Text style={styles.section}>Candlestick (recent)</Text>
        <View style={styles.candlesRow}>
          {history.slice(-40).map((c, idx) => (
            <Candle key={idx} o={c.open} h={c.high} l={c.low} c={c.close} />
          ))}
        </View>
      </Card>

      <Modal visible={buyVisible} transparent animationType="fade" onRequestClose={() => setBuyVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Card containerStyle={styles.modalCard}>
            <Text h4 style={styles.title}>Buy {symbol}</Text>
            <View style={styles.row}>
              <Button title="Market" type={orderType==='MARKET_BUY'?'solid':'outline'} onPress={() => setOrderType('MARKET_BUY')} buttonStyle={styles.secondaryBtn} />
              <Button title="Limit" type={orderType==='BUY'?'solid':'outline'} onPress={() => setOrderType('BUY')} buttonStyle={styles.secondaryBtn} />
            </View>
            <Input keyboardType="numeric" label="Quantity" value={qty} onChangeText={setQty} inputStyle={styles.input} labelStyle={styles.label} />
            {orderType === 'BUY' && (
              <Input keyboardType="numeric" label="Limit Price" value={limitPrice} onChangeText={setLimitPrice} inputStyle={styles.input} labelStyle={styles.label} />
            )}
            <View style={styles.actionsRow}>
              <Button title="Cancel" type="outline" onPress={() => setBuyVisible(false)} buttonStyle={styles.secondaryBtn} />
              <Button title={actionLoading? 'Placing...':'Place Order'} onPress={submitBuy} loading={actionLoading} buttonStyle={styles.primaryBtn} />
            </View>
          </Card>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#1C1C1C', borderRadius: 16, borderWidth: 0 },
  title: { color: '#FF8C00' },
  meta: { color: '#ccc', marginTop: 4 },
  desc: { color: '#fff', marginTop: 10 },
  section: { color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  price: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  kv: { color: '#ccc' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  primaryBtn: { borderRadius: 8 },
  secondaryBtn: { borderRadius: 8 },
  candlesRow: { flexDirection: 'row', alignItems: 'flex-end', height: 120 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#1C1C1C', borderRadius: 16 },
  input: { color: '#fff' },
  label: { color: '#ccc' },
});

export default StockDetailsScreen;


