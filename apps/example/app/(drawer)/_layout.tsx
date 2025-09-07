import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Drawer from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const router = useRouter();

  const _onPressItem = (viewMode: string, numberOfDays: number) => {
    router.setParams({ viewMode, numberOfDays: numberOfDays.toString() });
    props.navigation.closeDrawer();
  };

  const drawerItems = [
    { label: 'Day', icon: 'calendar-today', viewMode: 'day', numberOfDays: 1 },
    { label: '3 Days', icon: 'calendar-week', viewMode: 'week', numberOfDays: 3 },
    { label: '4 Days', icon: 'calendar-week', viewMode: 'week', numberOfDays: 4 },
    { label: 'Week', icon: 'calendar-week', viewMode: 'week', numberOfDays: 7 },
    { label: 'Work Week', icon: 'briefcase', viewMode: 'week', numberOfDays: 5 },
    { label: 'Resources', icon: 'account-group', viewMode: 'resources', numberOfDays: 1 },
  ];

  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <MaterialCommunityIcons name="calendar" size={32} color="#ffffff" />
        <Text style={[styles.headerTitle, { color: "#ffffff" }]}>
          Calendar Kit
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          View Modes
        </Text>
        {drawerItems.map((item, index) => (
          <DrawerItem
            key={index}
            label={item.label}
            icon={({ color, size }) => (
              <MaterialCommunityIcons name={item.icon as any} size={size} color={color} />
            )}
            labelStyle={[styles.drawerLabel, { color: theme.colors.text }]}
            style={[styles.drawerItem, { backgroundColor: theme.colors.card }]}
            onPress={() => _onPressItem(item.viewMode, item.numberOfDays)}
          />
        ))}
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.section}>
        <DrawerItem
          label="Settings"
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          )}
          labelStyle={[styles.drawerLabel, { color: theme.colors.text }]}
          style={[styles.drawerItem, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            router.push('/settings');
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  drawerItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

const DrawerLayout = () => {
  const _renderDrawer = (props: DrawerContentComponentProps) => (
    <CustomDrawerContent {...props} />
  );

  return (
    <Drawer
      screenOptions={{ drawerType: 'front' }}
      drawerContent={_renderDrawer}>
      <Drawer.Screen
        name="index"
        options={{ headerShown: false }}
        initialParams={{ viewMode: 'week', numberOfDays: 7 }}
      />
    </Drawer>
  );
};

export default DrawerLayout;

export const getNavOptions = () => ({ title: 'Home' });
