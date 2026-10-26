import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Per ora reindirizziamo direttamente alla tab "Oggi".
  // In futuro, qui metteremo il controllo: se non è loggato -> Login, altrimenti -> Tabs
  return <Redirect href="/(tabs)/today" />;
}