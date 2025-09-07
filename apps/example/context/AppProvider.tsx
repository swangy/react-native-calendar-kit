import type { Theme } from '@react-navigation/native';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import type { FC, PropsWithChildren } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';

type AppConfigs = {
  themeMode: 'light' | 'dark' | 'auto';
  startOfWeek: 1 | 6 | 7;
  showWeekNumber: boolean;
  dragToCreateMode: 'duration' | 'date-time';
};

interface AppContextValue {
  configs: AppConfigs;
  updateConfigs: (props: Partial<AppConfigs>) => void;
}

const AppContext = React.createContext<AppContextValue | undefined>(undefined);

const AppProvider: FC<PropsWithChildren<object>> = ({ children }) => {
  const [configs, setConfigs] = React.useState<AppConfigs>({
    themeMode: 'auto',
    startOfWeek: 1,
    showWeekNumber: true,
    dragToCreateMode: 'duration',
  });

  const colorScheme = useColorScheme();
  const themeValue = useMemo(() => {
    const lightTheme: Theme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        card: '#ffffff',
        background: '#fafafa',
        text: '#1f2937',
        border: '#e5e7eb',
        primary: '#6366f1',
      },
    };
    
    const darkTheme: Theme = {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        card: '#1e293b',
        background: '#0f172a',
        text: '#f1f5f9',
        border: '#334155',
        primary: '#818cf8',
      },
    };
    
    if (configs.themeMode === 'auto') {
      return colorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return configs.themeMode === 'dark' ? darkTheme : lightTheme;
  }, [colorScheme, configs.themeMode]);

  const _updateConfigs = useCallback((newConfigs: Partial<AppConfigs>) => {
    setConfigs((prev) => ({ ...prev, ...newConfigs }));
  }, []);

  const value = useMemo(() => {
    return {
      configs,
      updateConfigs: _updateConfigs,
    };
  }, [_updateConfigs, configs]);

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider value={themeValue}>{children}</ThemeProvider>
    </AppContext.Provider>
  );
};

export default AppProvider;

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
