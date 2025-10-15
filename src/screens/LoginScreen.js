// src/screens/LoginScreen.js

import React, { useState, useContext } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Text, Input, Icon } from '@rneui/themed';
import AuthContext from '../context/AuthContext';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Welcome Back</Text>
      
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
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        title="Sign In"
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        onPress={handleLogin}
        disabled={loading || !isFormValid}
        loading={loading}
        icon={loading ? null : { name: 'log-in-outline', type: 'ionicon', color: '#000' }}
        iconRight
      />
      
      <Button
        title="Don't have an account? Sign Up"
        type="clear"
        titleStyle={styles.linkText}
        onPress={() => navigation.navigate('Signup')}
      />
    </View>
  );
};

// ... Add similar styling for SignupScreen and other unauthenticated pages ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FF8C00', // Primary color
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputStyle: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#FF8C00', // Primary color
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 20,
  },
  buttonTitle: {
    color: '#000', // Black text on orange button
    fontWeight: 'bold',
  },
  linkText: {
    color: '#ccc',
    marginTop: 10,
  },
  errorText: {
    color: '#FF6347', // Tomato red for errors
    textAlign: 'center',
    marginBottom: 10,
  }
});

export default LoginScreen;