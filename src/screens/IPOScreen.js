import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button } from '@rneui/themed';
import { getAllIpos, applyForIpo } from '../api/tradeMentorApi';

const IPOScreen = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIpos = async () => {
    try {
      const data = await getAllIpos();
      setIpos(data);
    } catch (error) {
      console.error("Failed to fetch IPOs:", error);
      Alert.alert("Error", "Failed to fetch IPOs. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIpos();
  }, []);

  const handleApply = async (ipoId) => {
    // Replace these values with actual user inputs in your app
    const userId = "user123";
    const appliedLots = 1;

    try {
      const result = await applyForIpo(ipoId, userId, appliedLots);
      console.log("Applied Result:", result);
      Alert.alert("Success", "Your application has been submitted!");
      fetchIpos(); // refresh list after application
    } catch (error) {
      console.error("Failed to apply for IPO:", error);
      Alert.alert("Error", "Failed to apply. Please try again later.");
    }
  };

  const renderIpoItem = ({ item }) => {
    const [minPrice, maxPrice] = item.price?.split('-') || ['0', '0'];
    const status = item.status?.toLowerCase() === 'open' ? 'Open' : 'Closed';
  
    return (
      <Card containerStyle={styles.card}>
        <Text style={styles.ipoName}>{item.company || 'Upcoming Company'}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Open Date:</Text>
          <Text style={styles.value}>{item.openDate ? new Date(item.openDate).toDateString() : 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Price Band:</Text>
          <Text style={styles.value}>${minPrice} - ${maxPrice}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.status, status === 'Open' ? styles.statusOpen : styles.statusClosed]}>
            {status}
          </Text>
        </View>
        <Button
          title="Apply Now"
          buttonStyle={styles.applyButton}
          disabled={status !== 'Open'}
          onPress={() => handleApply(item._id)}
        />
      </Card>
    );
  };
  

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text h4 style={styles.pageTitle}>Initial Public Offerings (IPOs)</Text>
      <FlatList
        data={ipos}
        renderItem={renderIpoItem}
        keyExtractor={(item, index) => item._id || item.id || `ipo-${index}`}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No IPOs available right now.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIpos(); }} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold', fontSize: 20 },
  card: { backgroundColor: '#1C1C1C', borderRadius: 16, borderWidth: 0, padding: 16, marginBottom: 12 },
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
