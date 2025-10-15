// src/screens/ProfileScreen.js

import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator,  } from 'react-native';
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

  const list = [
    { title: 'Email', icon: 'mail-outline', value: profileData?.email || 'N/A' },
    { title: 'Member Since', icon: 'calendar-outline', value: profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A' },
    { title: 'Total Trades', icon: 'stats-chart-outline', value: profileData?.totalTrades?.toString() || '0' },
    { title: 'AI Chat History', icon: 'chatbox-outline', onPress: () => alert('Navigate to Chat History') },
    { title: 'Settings', icon: 'settings-outline', onPress: () => alert('Navigate to Settings') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      
      <Card containerStyle={styles.profileCard}>
        <View style={styles.header}>
          <Avatar
            size="large"
            rounded
            title={profileData?.name?.[0]?.toUpperCase() || 'U'}
            containerStyle={{ backgroundColor: '#FF8C00' }}
          />
          <View style={styles.headerText}>
            <Text h4 style={styles.nameText}>{profileData?.name || 'User Name'}</Text>
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