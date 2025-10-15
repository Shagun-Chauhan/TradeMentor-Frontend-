// src/screens/LearnScreen.js

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, SearchBar, Input, Button } from '@rneui/themed';
import { getLearnContent, searchLearnContent, chatWithAI, resetLearnChat } from '../api/tradeMentorApi';

const LearnScreen = () => {
  const [level, setLevel] = useState('beginner');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState('');

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await getLearnContent(level);
      setContent(Array.isArray(data) ? data : (data?.items || []));
      
    } catch (e) {
      console.error('Failed to load learn content', e);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const doSearch = async () => {
    setLoading(true);
    try {
      const data = await searchLearnContent(level, search);
      setContent(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      console.error('Search failed', e);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
  
    setChatLoading(true);
    setChatResponse('');
  
    try {
      const res = await chatWithAI(chatInput.trim());
      // ✅ Since backend always returns { reply: "..." }
      if (res?.reply) {
        setChatResponse(res.reply);
      } else {
        setChatResponse('No response from AI.');
      }
    } catch (e) {
      console.error('AI chat error:', e);
      setChatResponse('Failed to get AI response.');
    } finally {
      setChatLoading(false);
    }
  };
  
  useEffect(() => {
    loadContent();
  }, [level]);

  const renderItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      <Card.Title style={styles.cardTitle}>{item.topic || 'Learning Topic'}</Card.Title>
      <Text style={styles.cardBody}>{item.content || 'No content available.'}</Text>
      {item.reference_link ? (
        <Text style={{ color: '#FF8C00', marginTop: 6 }}>
          📘 Reference: {item.reference_link}
        </Text>
      ) : null}
      {item.video_link ? (
        <Text style={{ color: '#00BFFF', marginTop: 6 }}>
          🎥 Video: {item.video_link}
        </Text>
      ) : null}
    </Card>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
      
      <Text h4 style={styles.pageTitle}>Learn</Text>

      {/* Level Selector */}
      <View style={styles.levelContainer}>
  {['beginner', 'intermediate', 'advance'].map((lvl) => (
    <Button
      key={lvl}
      title={lvl.charAt(0).toUpperCase() + lvl.slice(1)}
      type={level === lvl ? 'solid' : 'outline'}
      onPress={() => setLevel(lvl)}
      buttonStyle={[
        styles.levelBtn,
        level === lvl && styles.levelBtnActive
      ]}
      titleStyle={[
        styles.levelText,
        level === lvl && styles.levelTextActive
      ]}
      containerStyle={styles.levelBtnContainer}
    />
  ))}
</View>

      {/* Search */}
      <SearchBar
        placeholder="Search learning content..."
        onChangeText={setSearch}
        value={search}
        onSubmitEditing={doSearch}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        lightTheme={false}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={content}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id || item._id || `${item.title}-${index}`)}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No content found.</Text>}
        />
      )}

      {/* AI Chat Section */}
      {/* AI Chat Section */}
<Card containerStyle={styles.chatCard}>
  <Card.Title style={styles.cardTitle}>Chat with AI</Card.Title>

  <Input
    placeholder="Ask anything about markets or learning topics..."
    value={chatInput}
    onChangeText={setChatInput}
    inputStyle={styles.input}
    placeholderTextColor="#888"
    containerStyle={styles.inputContainer}
  />

  <View style={styles.chatButtonsContainer}>
    <Button
      title={chatLoading ? 'Asking...' : 'Ask'}
      onPress={sendChat}
      disabled={chatLoading}
      buttonStyle={styles.askBtn}
      containerStyle={styles.buttonContainer}
      titleStyle={styles.buttonTitle}
    />
    <Button
      title="Reset"
      type="outline"
      onPress={async () => {
        try {
          await resetLearnChat();
          setChatResponse('');
          setChatInput('');
        } catch (e) {
          console.error(e);
        }
      }}
      buttonStyle={styles.resetBtn}
      containerStyle={styles.buttonContainer}
      titleStyle={styles.buttonTitleOutline}
    />
  </View>

  {chatResponse ? (
    <ScrollView style={styles.chatResponseContainer}>

      <Text style={styles.chatResponse}>{chatResponse}</Text>
    </ScrollView>
  ) : null}
</Card>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  pageTitle: { color: '#fff', margin: 10, fontWeight: 'bold' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginBottom: 10 },
  levelBtn: { borderRadius: 8, width: '32%' },
  searchContainer: { backgroundColor: '#000', borderBottomColor: 'transparent', borderTopColor: 'transparent' },
  searchInputContainer: { backgroundColor: '#1C1C1C', borderRadius: 8 },
  searchInput: { color: '#fff' },
  card: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 15, marginBottom: 12 },
  cardTitle: { color: '#FF8C00', fontSize: 18, fontWeight: 'bold', textAlign: 'left' },
  cardBody: { color: '#fff', marginTop: 6 },
  emptyText: { color: '#ccc', textAlign: 'center', padding: 20 },
  chatCard: { backgroundColor: '#1C1C1C', borderRadius: 12, borderWidth: 0, padding: 15, marginVertical: 12 },
  input: { color: '#fff' },
  chatActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  askBtn: { borderRadius: 8 },
  resetBtn: { borderRadius: 8 },
  chatResponse: { color: '#fff', marginTop: 10 },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginBottom: 15,
  },
  
  levelBtnContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  
  levelBtn: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
  },
  
  levelBtnActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  
  levelText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  
  levelTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chatResponseContainer: {
    maxHeight: 200,   // limit height, scroll appears if content exceeds this
    marginTop: 12,
    padding: 10,
    backgroundColor: '#111', // subtle contrast
    borderRadius: 8,
  },
  
  
});

export default LearnScreen;
