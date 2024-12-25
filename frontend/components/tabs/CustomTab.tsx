import { TabTriggerSlotProps } from 'expo-router/ui';
import { Ref, forwardRef } from 'react';
import { Pressable, Text, View } from 'react-native';

export type CustomTabProps = TabTriggerSlotProps & {
  children: string;
};

export const CustomTab = forwardRef(
  ({ children, isFocused, ...props }: CustomTabProps, ref: Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={{
          flex: 1,
          height: '100%',
          width: 120,
          flexGrow: 1,
        }}>
        <View
          style={{
            flex: 1,
            borderBottomWidth: isFocused ? 1 : 0,
            borderColor: 'black',
            borderRadius: 20,
            paddingLeft: 10,
            paddingRight: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#383838',
              fontSize: 18,
              textAlign: 'center',
              fontWeight: isFocused ? '700' : '600',
            }}>
            {children}
          </Text>
        </View>
      </Pressable>
    );
  }
); 