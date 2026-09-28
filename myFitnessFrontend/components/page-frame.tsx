import { PropsWithChildren } from 'react';
import { View, ViewStyle, useWindowDimensions } from 'react-native';

type PageFrameProps = PropsWithChildren<{
  maxWidth?: number;
  style?: ViewStyle;
}>;

export function PageFrame({
  children,
  maxWidth = 1120,
  style,
}: PageFrameProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <View
      style={[
        {
          alignSelf: 'center',
          width: '100%',
          maxWidth,
          paddingHorizontal: isDesktop ? 32 : 18,
          paddingTop: isDesktop ? 32 : 18,
          paddingBottom: isDesktop ? 56 : 40,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
