import { UnavailableHourProps } from '@howljs/calendar-kit';
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
            stroke="#e2e8f0"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.6}
          />
        </Pattern>
      </Defs>
      <AnimatedRect
        x="0"
        y="0"
        width="100%"
        fill="#f8fafc"
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
