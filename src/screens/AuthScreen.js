// src/screens/AuthScreen.js

import React, { useState, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,Button } from 'react-native';
// New style using the RNE themed package
import { Text, Input, Icon, Card } from '@rneui/themed';
import AuthContext from '../context/AuthContext';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useContext(AuthContext);

  const switchMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    // Clear form on switch
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleAuth = async () => {
    setError('');
    if (!email || !password || (!isLogin && (!name || password !== confirmPassword))) {
        return setError(isLogin ? 'Please fill in all fields.' : 'Please fill in all fields and ensure passwords match.');
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
    } catch (err) {
      setError(err.message || (isLogin ? 'Login failed.' : 'Sign up failed.'));
    } finally {
      setLoading(false);
    }
  };
  
  const isFormValid = email.length > 0 && password.length > 0 && (isLogin || (name.length > 0 && password === confirmPassword));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text h3 style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to access your trading portfolio.' : 'Join TradeMentor and start learning today.'}
        </Text>

        {!isLogin && (
          <Input
            placeholder="Name"
            onChangeText={setName}
            value={name}
            leftIcon={<Icon name="person-outline" type="ionicon" color="#ccc" />}
            inputStyle={styles.inputStyle}
            containerStyle={styles.inputContainer}
          />
        )}
        
        <Input
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Icon name="mail-outline" type="ionicon" color="#ccc" />}
          inputStyle={styles.inputStyle}
          containerStyle={styles.inputContainer}
        />

        <Input
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          leftIcon={<Icon name="lock-closed-outline" type="ionicon" color="#ccc" />}
          inputStyle={styles.inputStyle}
          containerStyle={styles.inputContainer}
        />

        {!isLogin && (
          <Input
            placeholder="Confirm Password"
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            secureTextEntry
            leftIcon={<Icon name="lock-closed-outline" type="ionicon" color="#ccc" />}
            inputStyle={styles.inputStyle}
            containerStyle={styles.inputContainer}
          />
        )}
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={isLogin ? "Sign In" : "Sign Up"}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={handleAuth}
          disabled={loading || !isFormValid}
          loading={loading}
          icon={loading ? null : { name: isLogin ? 'log-in-outline' : 'person-add-outline', type: 'ionicon', color: '#000' }}
          iconRight
        />
        
        <Button
          title={isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          type="clear"
          titleStyle={styles.linkText}
          onPress={switchMode}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    color: '#FF8C00', 
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputStyle: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#FF8C00', 
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 20,
  },
  buttonTitle: {
    color: '#000', 
    fontWeight: 'bold',
  },
  linkText: {
    color: '#ccc',
    marginTop: 10,
  },
  errorText: {
    color: '#FF6347', 
    textAlign: 'center',
    marginBottom: 10,
  }
});

export default AuthScreen;