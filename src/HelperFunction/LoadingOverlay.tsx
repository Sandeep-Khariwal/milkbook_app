import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type Props = {
  visible: boolean;
};

const LoadingOverlay = ({ visible }: Props) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"   // 'dark' | 'extraLight'
        blurAmount={8}
        reducedTransparencyFallbackColor="white"
      />
      <ActivityIndicator size="large" color="#5086E7" />
    </View>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
