// src/screens/IPOScreen.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Button,  } from 'react-native';
import { Text, Card,  } from '@rneui/themed';
import { getAllIpos } from '../api/tradeMentorApi';

const IPOScreen = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIpos = async () => {
      try {
        const data = await getAllIpos();
        // Assuming data is an array of IPO objects
        setIpos(data);
      } catch (error) {
        console.error("Failed to fetch IPOs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIpos();
  }, []);

  const renderIpoItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      <Text style={styles.ipoName}>{item.companyName || 'Upcoming Company'}</Text>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Open Date:</Text>
        <Text style={styles.value}>{item.openDate || 'N/A'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Price Band:</Text>
        <Text style={styles.value}>${item.minPrice || 0} - ${item.maxPrice || 0}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.status, item.status === 'Open' ? styles.statusOpen : styles.statusClosed]}>
          {item.status || 'Upcoming'}
        </Text>
      </View>
      <Button
        title="Apply Now"
        buttonStyle={styles.applyButton}
        disabled={item.status !== 'Open'}
      />
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text h4 style={styles.pageTitle}>Initial Public Offerings (IPOs)</Text>
      <FlatList
        data={ipos}
        renderItem={renderIpoItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for the tab bar
        ListEmptyComponent={<Text style={styles.emptyText}>No IPOs available right now.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold' },
  card: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 15, marginBottom: 10 },
  ipoName: { color: '#FF8C00', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label: { color: '#ccc', fontSize: 14 },
  value: { color: '#fff', fontSize: 14, fontWeight: '600' },
  status: { fontSize: 14, fontWeight: 'bold' },
  statusOpen: { color: '#4CAF50' },
  statusClosed: { color: '#FF6347' },
  applyButton: { backgroundColor: '#FF8C00', borderRadius: 8, marginTop: 15 },
  emptyText: { color: '#ccc', textAlign: 'center', padding: 20 },
});

export default IPOScreen;