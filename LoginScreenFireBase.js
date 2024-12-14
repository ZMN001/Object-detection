import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert,StatusBar, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';

const LoginScreenFireBase = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const LoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      const userlogin = await auth().signInWithEmailAndPassword(email, password);
      console.log(userlogin);
      navigation.navigate('Profile', {
        Email: userlogin.user.email,
        UID: userlogin.user.uid,
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Login Failed', err.message);
    }
  };

  return (
    <ImageBackground style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} source={require('./Assets/grade.jpg')}>
   
      <StatusBar barStyle="light-content" 
      translucent={true}
        backgroundColor={'transparent'}
         />
      <Text style={styles.txt1}>LOGIN</Text>
      <View style={styles.view2}></View>
      <TextInput
        style={styles.txtinput}
        placeholder="Enter Your Email"
        value={email}
        onChangeText={value => setEmail(value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.txtinput}
        placeholder="Enter Your Password"
        value={password}
        onChangeText={value => setPassword(value)}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.button} onPress={LoginPress}>
        <Text style={styles.txt2}>Login to Begin</Text>
      </TouchableOpacity>
      <Text style={styles.txt3} onPress={() => navigation.navigate('Signup')}>
        Don't have an account? SignUp
      </Text>
    </ImageBackground>
  );
};

export default LoginScreenFireBase;

const styles = StyleSheet.create({
  view1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  view2: {
    width: 350,
    height: 1,
    backgroundColor: 'black',
  },
  txt1: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    margin: 10,
  },
  txtinput: {
    width: 280,
    padding: 10,
    margin: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor:'white'
  },
  button: {
    backgroundColor: 'blue',
    height: 50,
    width: 250,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  txt2: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    margin: 10,
    color: 'white',
  },
  txt3: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    margin: 10,
    color: 'black',
  },
});
