

import React, { useState, useRef } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Animated, TextInput, Button, Clipboard, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import Ripple from 'react-native-material-ripple';
import * as Speech from 'expo-speech';
import axios from 'axios';

const App = () => {
  const [inputMessage, setInputMessage] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);

  // Mengatur animasi saat menekan tombol
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      friction: 3,
      tension: 150,
      useNativeDriver: true,
    }).start();
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 150,
      useNativeDriver: true,
    }).start();
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  const fetchResponseAndSpeak = async () => {
    if (!inputMessage) {
      alert('Message is required');
      return;
    }

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
        {
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          messages: [{ role: 'user', content: inputMessage }],
          max_tokens: 500,
          stream: false,
        },
        {
          headers: {
            Authorization: 'Bearer ',
            'Content-Type': 'application/json',
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      // Mainkan animasi Lottie dan suarakan respons
      if (animationRef.current) {
        animationRef.current.play(); // Mainkan animasi Lottie
      }

      // Mulai berbicara dan animasi terus berjalan selama proses
      Speech.speak(aiResponse, {
        onStart: () => {
          // Animasi dimulai saat suara mulai berbicara
          if (animationRef.current) {
            animationRef.current.play();
          }
        },
        onDone: () => {
          // Reset animasi setelah suara selesai
          if (animationRef.current) {
            animationRef.current.reset();
          }
        },
      });

      // Clear the clipboard
      Clipboard.setString('');

      // Reset the input message
      setInputMessage('');
    } catch (error) {
      console.error('Error fetching response from Hugging Face:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.section}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity style={styles.button} onPress={fetchResponseAndSpeak}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
      <Ripple
        rippleColor="rgba(0, 0, 0, 0.3)"
        rippleSize={Dimensions.get('window').width}
        rippleDuration={600}
        style={styles.rippleContainer}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[styles.lottieContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <LottieView
            ref={animationRef}
            source={{ uri: 'https://lottie.host/2dd9dca2-2cae-4d13-add1-e62c4c5d9570/DHSIbELfbp.lottie' }}
            autoPlay={false}
            loop={true}  // Looping animasi selama berbicara
            style={styles.lottie}
          />
        </Animated.View>
      </Ripple>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  section: {
    position: 'absolute',
    bottom: 15, // Adjusted for some margin at the bottom
    width: Dimensions.get('window').width - 40, // Added responsive width with padding
    paddingHorizontal: 20, // Padding for input field
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 20,  // Custom left padding
    paddingRight: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25, // Rounded border for a more professional look
    marginBottom: 10, // Space between input and button
    width: '100%', // Ensure the input is responsive
  },
  button: {
    backgroundColor: 'black',  // Black background for the button
    paddingVertical: 12,        // Vertical padding for button height
    paddingHorizontal: 25,      // Horizontal padding for button width
    borderRadius: 25,          // Rounded corners for the button
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',            // White text color
    fontSize: 16,              // Font size for button text
    fontWeight: 'bold',        // Bold text style
  },
  rippleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '80%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  lottieContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default App;
