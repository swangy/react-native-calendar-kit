import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { useCalendar, useMethods } from '@howljs/calendar-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

const ResourceNavigation = () => {
  const { hourWidth } = useCalendar();
  const methods = useMethods();
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { paddingLeft: hourWidth }]}>
      <Pressable
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => methods.goToPrevResource(true)}>
        <MaterialCommunityIcons 
          name="chevron-left" 
          size={20} 
          color="#ffffff" 
        />
        <Text style={[styles.buttonText, { color: "#ffffff" }]}>
          Previous
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => methods.goToNextResource(true)}>
        <Text style={[styles.buttonText, { color: "#ffffff" }]}>
          Next
        </Text>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color="#ffffff" 
        />
      </Pressable>
    </View>
  );
};

export default ResourceNavigation;

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
