import ChoresView from '@/components/ChoresView';
import { useAuth } from '@/context/auth';
import { useGetHouseholdChoresQuery } from '@/store/choresApi';
import { useAppSelector } from '@/store/hooks';

export default function Week() {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );
  const { data: chores, refetch } = useGetHouseholdChoresQuery(
    selectedHouseholdId || ''
  );

  const handleRefresh = async () => {
    await refetch().unwrap();
  };

  return (
    <ChoresView isUser={false} data={chores || []} onRefresh={handleRefresh} />
  );
}
