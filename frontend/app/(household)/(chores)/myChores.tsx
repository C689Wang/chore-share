import ChoresView from '@/components/ChoresView';
import { useAuth } from '@/context/auth';
import { useGetAccountChoresQuery } from '@/store/choresApi';
import { useAppSelector } from '@/store/hooks';

export default function MyChores() {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );
  const { data: chores, refetch } = useGetAccountChoresQuery({
    accountId: user?.id || '',
    householdId: selectedHouseholdId || '',
  });

  const handleRefresh = async () => {
    await refetch().unwrap();
  };

  return (
    <ChoresView isUser={true} data={chores || []} onRefresh={handleRefresh} />
  );
}
