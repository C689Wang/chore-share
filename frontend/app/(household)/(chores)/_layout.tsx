import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTab } from '../../../components/tabs/CustomTab';

export default function ChoresLayout() {
  return (
    <SafeAreaView
      style={{
        backgroundColor: '#FFFCF4',
        flex: 1,
      }}
    >
      <Tabs>
        <TabList
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingLeft: 25,
            paddingRight: 25,
            height: 50,
            backgroundColor: '#FFFCF4',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <TabTrigger name='week' href='/(household)/(chores)/week' asChild>
            <CustomTab>This Week</CustomTab>
          </TabTrigger>
          <TabTrigger
            name='my-chores'
            href='/(household)/(chores)/myChores'
            asChild
          >
            <CustomTab>My Chores</CustomTab>
          </TabTrigger>
          <TabTrigger name='create' href='/(household)/(chores)/create' asChild>
            <CustomTab>Create</CustomTab>
          </TabTrigger>
        </TabList>
        <TabSlot />
      </Tabs>
    </SafeAreaView>
  );
}
