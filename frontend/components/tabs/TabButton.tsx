import { MaterialIcons } from '@expo/vector-icons';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, Ref, forwardRef } from 'react';
import { View, Pressable } from 'react-native';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type TabButtonProps = TabTriggerSlotProps & {
  icon: IconName;
};

export const TabButton = forwardRef(
  ({ icon, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={{
          margin: 'auto',
          flexGrow: 1,
          paddingLeft: 25,
          paddingRight: 25,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{
          borderBottomWidth: isFocused ? 2 : 0,
          borderColor: 'black',
          paddingBottom: 5,
          height: 45,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MaterialIcons 
            name={icon} 
            size={32} 
            color={isFocused ? 'black' : '#999999'} 
          />
        </View>
      </Pressable>
    );
  }
);
