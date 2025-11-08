import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './navigation/TabNavigator';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundaryClass from "./components/ErrorBoundary";
import RootNavigator from "./navigation/TabNavigator";


export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ErrorBoundaryClass>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ErrorBoundaryClass>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
