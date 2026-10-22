import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SimulatorScreen } from './src/screens/SimulatorScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <SimulatorScreen />
    </SafeAreaProvider>
  );
}
