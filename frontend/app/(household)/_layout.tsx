import { Stack } from "expo-router";

export default function HouseholdLayout() {
  return (
    <Stack>
      <Stack.Screen name="household" options={{ headerShown: false }} />
    </Stack>
  );
}
