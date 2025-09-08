import { UnavailableHourProps, useTheme } from '@howljs/calendar-kit';
import React, { FC } from 'react';
import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Defs, Line, Pattern, Rect, Svg } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CustomUnavailableHour: FC<
  UnavailableHourProps & {
    width: SharedValue<number>;
    height: SharedValue<number>;
  }
> = (props) => {
  const patternSize = 8;
  
  // Get theme colors for proper dark mode support
  const unavailableHourBackgroundColor = useTheme((state) => state.unavailableHourBackgroundColor);
  const surfaceColor = useTheme((state) => state.colors.surface);
  
  // Use theme colors or fallback to defaults
  const backgroundColor = unavailableHourBackgroundColor || surfaceColor;
  
  // Create more visible stripe colors based on theme
  const isDarkMode = backgroundColor && backgroundColor.includes('#0a0f1a') || backgroundColor === '#1e293b';
  const stripeColor = isDarkMode 
    ? '#475569' // More visible gray for dark mode
    : '#94a3b8'; // More visible gray for light mode

  const rectProps = useAnimatedProps(() => ({
    height: props.height.value,
    width: props.width.value,
  }));

  return (
    <Svg>
      <Defs>
        <Pattern
          id="modern-stripe-pattern"
          patternUnits="userSpaceOnUse"
          width={patternSize}
          height={patternSize}
          patternTransform="rotate(-45)">
          <Line
            x1={0}
            y={0}
            x2={0}
            y2={patternSize + 8}
            stroke={stripeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.8}
          />
        </Pattern>
      </Defs>
      <AnimatedRect
        x="0"
        y="0"
        width="100%"
        fill={backgroundColor}
        animatedProps={rectProps}
      />
      <AnimatedRect
        x="0"
        y="0"
        width="100%"
        fill="url(#modern-stripe-pattern)"
        animatedProps={rectProps}
      />
    </Svg>
  );
};

export default CustomUnavailableHour;
