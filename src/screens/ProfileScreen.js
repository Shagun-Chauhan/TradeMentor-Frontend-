// src/screens/ProfileScreen.js

import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator,  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Icon, ListItem, Avatar, Button } from '@rneui/themed';
import AuthContext from '../context/AuthContext';
import { getProfile } from '../api/tradeMentorApi';


const ProfileScreen = () => {
  const { user, signOut } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(user); // Start with context user
  const [loading, setLoading] = useState(false);

  // Fetch updated profile (optional, but good practice)
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfileData(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // If token is invalid, signOut might be needed here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }
// console.log(profileData);

const list = [
  { 
    title: 'Email', 
    icon: 'mail-outline', 
    value: profileData?.user?.email || 'N/A' 
  },
  { 
    title: 'Name', 
    icon: 'person-outline', 
    value: profileData?.user?.name || 'N/A' 
  },
  { 
    title: 'Cash Balance', 
    icon: 'wallet-outline', 
    value: profileData?.user?.cashBalance?.toFixed(2) || '0.00' 
  },
  { 
    title: 'Blocked Funds', 
    icon: 'lock-closed-outline', 
    value: profileData?.user?.blockedFunds?.toFixed(2) || '0.00' 
  },
  { 
    title: 'Member Since', 
    icon: 'calendar-outline', 
    value: profileData?.user?.createdAt ? new Date(profileData.user.createdAt).toLocaleDateString() : 'N/A' 
  },
  { 
    title: 'Total Trades', 
    icon: 'stats-chart-outline', 
    value: profileData?.user?.totalTrades?.toString() || '0' 
  },
  { 
    title: 'AI Chat History', 
    icon: 'chatbox-outline', 
    onPress: () => alert('Navigate to Chat History') 
  },
  { 
    title: 'Settings', 
    icon: 'settings-outline', 
    onPress: () => alert('Navigate to Settings') 
  },
];


  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
      
      <Card containerStyle={styles.profileCard}>
        <View style={styles.header}>
          <Avatar
            size="large"
            rounded
            title={profileData?.name?.[0]?.toUpperCase() || 'U'}
            containerStyle={{ backgroundColor: '#FF8C00' }}
          />
          <View style={styles.headerText}>
            <Text h4 style={styles.nameText}>{profileData?.user?.name || 'User Name'}</Text>
            <Text style={styles.statusText}>Pro Trader Status: Active</Text>
          </View>
        </View>
      </Card>
      
      <Card containerStyle={styles.infoCard}>
        {list.map((item, i) => (
          <ListItem key={i} bottomDivider containerStyle={styles.listItem}>
            <Icon name={item.icon} type="ionicon" color="#FF8C00" size={24} />
            <ListItem.Content>
              <ListItem.Title style={styles.listTitle}>{item.title}</ListItem.Title>
            </ListItem.Content>
            {item.value ? (
              <Text style={styles.listValue}>{item.value}</Text>
            ) : (
              <ListItem.Chevron color="#ccc" onPress={item.onPress} />
            )}
          </ListItem>
        ))}
      </Card>

      <Button
        title="Sign Out"
        buttonStyle={styles.signOutButton}
        titleStyle={styles.signOutTitle}
        onPress={signOut}
        icon={{ name: 'log-out-outline', type: 'ionicon', color: '#fff' }}
        iconRight
      />

    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  profileCard: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 20, marginBottom: 15 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: 15 },
  nameText: { color: '#fff', fontWeight: 'bold' },
  statusText: { color: '#4CAF50', fontSize: 14, marginTop: 5 },
  infoCard: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 0, marginBottom: 20 },
  listItem: { backgroundColor: '#1C1C1C' },
  listTitle: { color: '#fff' },
  listValue: { color: '#ccc' },
  signOutButton: { 
    backgroundColor: '#FF6347', 
    borderRadius: 8, 
    paddingVertical: 12, 
    marginHorizontal: 15 
  },
  signOutTitle: { color: '#fff', fontWeight: 'bold' },
});

export default ProfileScreen;