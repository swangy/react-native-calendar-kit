import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions, useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  currentDate: string;
  onPressToday?: () => void;
  onPressPrevious?: () => void;
  onPressNext?: () => void;
  onCreateEvent?: () => void;
  isResourcesMode?: boolean;
}

const Header: FC<HeaderProps> = ({
  currentDate,
  onPressToday,
  onPressPrevious,
  onPressNext,
  onCreateEvent,
  isResourcesMode,
}) => {
  const theme = useTheme();
  const { top: safeTop } = useSafeAreaInsets();

  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const title = useMemo(() => {
    const formatted = new Date(currentDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: isResourcesMode ? 'numeric' : undefined,
    });
    return formatted;
  }, [isResourcesMode, currentDate]);

  const _onPressMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View
      style={[
        styles.header,
        { 
          paddingTop: safeTop + 16, 
          backgroundColor: theme.colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.menuBtn, { backgroundColor: theme.colors.card }]}
        onPress={_onPressMenu}>
        <MaterialCommunityIcons
          name="menu"
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
      <View style={styles.headerRightContent}>
        <View style={[styles.navigation, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity 
            hitSlop={12} 
            style={styles.navButton}
            onPress={onPressPrevious}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            hitSlop={12} 
            style={styles.navButton}
            onPress={onPressNext}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {onCreateEvent && (
          <TouchableOpacity
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            activeOpacity={0.7}
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={onCreateEvent}>
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          activeOpacity={0.7}
          style={[styles.todayButton, { backgroundColor: theme.colors.primary }]}
          onPress={onPressToday}>
          <MaterialCommunityIcons
            name="calendar-today"
            size={20}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuBtn: { 
    width: 44, 
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRightContent: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    flexShrink: 1,
  },
  headerTitle: { 
    flexGrow: 1, 
    flexShrink: 1, 
    fontSize: 20, 
    fontWeight: '600',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 8,
  },
  todayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
