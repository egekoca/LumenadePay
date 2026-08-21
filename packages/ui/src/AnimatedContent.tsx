import {useEffect, useRef, type ReactNode} from 'react';
import {Animated, Easing, type StyleProp, type ViewStyle} from 'react-native';

type AnimatedContentProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedContent({children, delay = 0, distance = 12, duration = 420, style}: AnimatedContentProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      delay,
      duration,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [distance, 0]})}],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
