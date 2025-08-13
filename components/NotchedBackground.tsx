import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function NotchedBackground({ color = '#fff', height = 70 }) {
  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Path
          fill={color}
          d="
            M0,0 
            H35 
            C40,0 45,30 50,30 
            C55,30 60,0 65,0 
            H100 
            V100 
            H0 
            Z
          "
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 0,
  },
});
