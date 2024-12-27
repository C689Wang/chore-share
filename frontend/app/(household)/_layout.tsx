import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { TabButton } from '../../components/tabs/TabButton';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function HouseholdLayout() {
  return (
    <SafeAreaProvider
      style={{
        backgroundColor: '#FFFCF4',
        flex: 1,
      }}
    >
      <Tabs>
        <TabSlot />
        <TabList
          style={{
            backgroundColor: '#FFFCF4',
            height: 70,
            paddingLeft: 30,
            paddingRight: 30,
            flexDirection: 'row',
          }}
        >
          <TabTrigger name='household' href='/(household)/household' asChild>
            <TabButton icon='home' />
          </TabTrigger>
          <TabTrigger name='chores' href='/(household)/(chores)/week' asChild>
            <TabButton icon='cleaning-services' />
          </TabTrigger>
          <TabTrigger
            name='transactions'
            href='/(household)/transactions'
            asChild
          >
            <TabButton icon='account-balance-wallet' />
          </TabTrigger>
          <TabTrigger name='settings' href='/(household)/settings' asChild>
            <TabButton icon='settings' />
          </TabTrigger>
        </TabList>
      </Tabs>
    </SafeAreaProvider>
  );
}
