import React from 'react';
// import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default ({ navigation }) => {
  const githubUsername = navigation.getParam('githubUsername');

  return (
    <WebView
      style={{ flex: 1 }}
      source={{
        uri: `https://github.com/${githubUsername}`,
        originWhiteList: ['*']
      }}
    />
  );
};
