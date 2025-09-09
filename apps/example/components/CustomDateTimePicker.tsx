import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

interface CustomDateTimePickerProps {
  isVisible: boolean;
  mode: 'date' | 'time';
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
  title?: string;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  isVisible,
  mode,
  date,
  onConfirm,
  onCancel,
  minimumDate,
  title,
}) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(date);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Auto-scroll to current values when picker becomes visible
  useEffect(() => {
    if (isVisible) {
      // Always reset to the fresh date prop first
      setSelectedDate(new Date(date.getTime())); // Create new Date object to avoid reference issues
      
      // Multiple attempts to ensure scrolling works reliably
      const scrollWithDelay = (attempt = 0) => {
        const delay = attempt === 0 ? 200 : attempt * 150; // Longer initial delay, progressive delays
        
        setTimeout(() => {
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            if (mode === 'date') {
              scrollToDateValues();
            } else {
              scrollToTimeValues();
            }
          });
          
          // Try again if first few attempts (to handle slow rendering)
          if (attempt < 3) { // Increased attempts
            scrollWithDelay(attempt + 1);
          }
        }, delay);
      };
      
      scrollWithDelay();
    }
  }, [isVisible, date, mode]);

  const scrollToDateValues = () => {
    // Use the fresh date prop instead of potentially stale selectedDate
    const currentMonth = date.getMonth();
    const currentDay = date.getDate();
    const currentYear = date.getFullYear();
    const years = generateYears();
    const yearIndex = years.indexOf(currentYear);

    // Scroll to center the selected values in 250px container (40px item height, center at 125px)
    const containerCenter = 125; // 250px / 2
    const itemHeight = 40;
    const scrollOffset = containerCenter - (itemHeight / 2); // Position item center at container center

    // Add safety checks and ensure refs exist before scrolling
    if (monthScrollRef.current && currentMonth >= 0 && currentMonth < 12) {
      const monthScrollY = Math.max(0, currentMonth * itemHeight - scrollOffset);
      monthScrollRef.current.scrollTo({
        y: monthScrollY,
        animated: true,
      });
    }

    if (dayScrollRef.current && currentDay >= 1) {
      const dayScrollY = Math.max(0, (currentDay - 1) * itemHeight - scrollOffset);
      dayScrollRef.current.scrollTo({
        y: dayScrollY,
        animated: true,
      });
    }

    if (yearScrollRef.current && yearIndex >= 0) {
      const yearScrollY = Math.max(0, yearIndex * itemHeight - scrollOffset);
      yearScrollRef.current.scrollTo({
        y: yearScrollY,
        animated: true,
      });
    }
  };

  const scrollToTimeValues = () => {
    // Use the fresh date prop instead of potentially stale selectedDate
    const currentHour = date.getHours() ;  // Offset by 2 to center hour better 
    const currentMinute = date.getMinutes();
    // Find the closest 5-minute interval
    const minuteIndex = Math.floor(currentMinute / 5);

    // Same calculation for time picker with 250px container
    const containerCenter = 80; // 250px / 2
    const itemHeight = 40;
    const scrollOffset = containerCenter - (itemHeight / 2); // Position item center at container center

    // Add safety checks and ensure refs exist before scrolling
    if (hourScrollRef.current && currentHour >= 0 && currentHour < 24) {  // Adjusted range for offset
      const hourScrollY = Math.max(0, currentHour * itemHeight - scrollOffset);
      hourScrollRef.current.scrollTo({
        y: hourScrollY,
        animated: true,
      });
    }

    if (minuteScrollRef.current && minuteIndex >= 0) {
      const minuteScrollY = Math.max(0, minuteIndex * itemHeight - scrollOffset);
      minuteScrollRef.current.scrollTo({
        y: minuteScrollY,
        animated: true,
      });
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const generateHours = () => {
    const hours = [];
    for (let hour = 0; hour < 24; hour++) {
      hours.push(hour);
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let minute = 0; minute < 60; minute += 5) {
      minutes.push(minute);
    }
    return minutes;
  };

  const renderDatePicker = () => {
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const currentDay = selectedDate.getDate();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    return (
      <View style={dynamicStyles.pickerContainer}>
        {/* Month Picker */}
        <View style={dynamicStyles.pickerColumn}>
          <Text style={dynamicStyles.pickerLabel}>Month</Text>
          <ScrollView 
            ref={monthScrollRef}
            style={dynamicStyles.scrollPicker} 
            showsVerticalScrollIndicator={false}
          >
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  dynamicStyles.pickerItem,
                  currentMonth === index && dynamicStyles.pickerItemSelected,
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(index);
                  // Adjust day if it's invalid for the new month
                  const daysInNewMonth = getDaysInMonth(newDate.getFullYear(), index);
                  if (newDate.getDate() > daysInNewMonth) {
                    newDate.setDate(daysInNewMonth);
                  }
                  setSelectedDate(newDate);
                }}
              >
                <Text style={[
                  dynamicStyles.pickerItemText,
                  currentMonth === index && dynamicStyles.pickerItemTextSelected,
                ]}>
                  {month.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Day Picker */}
        <View style={dynamicStyles.pickerColumn}>
          <Text style={dynamicStyles.pickerLabel}>Day</Text>
          <ScrollView 
            ref={dayScrollRef}
            style={dynamicStyles.scrollPicker} 
            showsVerticalScrollIndicator={false}
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  dynamicStyles.pickerItem,
                  currentDay === day && dynamicStyles.pickerItemSelected,
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(day);
                  setSelectedDate(newDate);
                }}
              >
                <Text style={[
                  dynamicStyles.pickerItemText,
                  currentDay === day && dynamicStyles.pickerItemTextSelected,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Year Picker */}
        <View style={dynamicStyles.pickerColumn}>
          <Text style={dynamicStyles.pickerLabel}>Year</Text>
          <ScrollView 
            ref={yearScrollRef}
            style={dynamicStyles.scrollPicker} 
            showsVerticalScrollIndicator={false}
          >
            {generateYears().map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  dynamicStyles.pickerItem,
                  currentYear === year && dynamicStyles.pickerItemSelected,
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setFullYear(year);
                  setSelectedDate(newDate);
                }}
              >
                <Text style={[
                  dynamicStyles.pickerItemText,
                  currentYear === year && dynamicStyles.pickerItemTextSelected,
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const currentHour = selectedDate.getHours();
    const currentMinute = selectedDate.getMinutes();

    return (
      <View style={dynamicStyles.pickerContainer}>
        {/* Hour Picker */}
        <View style={dynamicStyles.pickerColumn}>
          <Text style={dynamicStyles.pickerLabel}>Hour</Text>
          <ScrollView 
            ref={hourScrollRef}
            style={dynamicStyles.scrollPicker} 
            showsVerticalScrollIndicator={false}
          >
            {generateHours().map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  dynamicStyles.pickerItem,
                  currentHour === hour && dynamicStyles.pickerItemSelected,
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setHours(hour);
                  setSelectedDate(newDate);
                }}
              >
                <Text style={[
                  dynamicStyles.pickerItemText,
                  currentHour === hour && dynamicStyles.pickerItemTextSelected,
                ]}>
                  {hour.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Minute Picker */}
        <View style={dynamicStyles.pickerColumn}>
          <Text style={dynamicStyles.pickerLabel}>Minute</Text>
          <ScrollView 
            ref={minuteScrollRef}
            style={dynamicStyles.scrollPicker} 
            showsVerticalScrollIndicator={false}
          >
            {generateMinutes().map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  dynamicStyles.pickerItem,
                  currentMinute >= minute && currentMinute < minute + 5 && dynamicStyles.pickerItemSelected,
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMinutes(minute);
                  setSelectedDate(newDate);
                }}
              >
                <Text style={[
                  dynamicStyles.pickerItemText,
                  currentMinute >= minute && currentMinute < minute + 5 && dynamicStyles.pickerItemTextSelected,
                ]}>
                  {minute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const dynamicStyles = getStyles(theme);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>{title || `Select ${mode}`}</Text>
          </View>
          
          <View style={dynamicStyles.content}>
            {mode === 'date' ? renderDatePicker() : renderTimePicker()}
          </View>

          <View style={dynamicStyles.footer}>
            <TouchableOpacity style={dynamicStyles.cancelButton} onPress={onCancel}>
              <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamicStyles.confirmButton} 
              onPress={() => onConfirm(selectedDate)}
            >
              <Text style={dynamicStyles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    padding: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 250,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: theme.colors.text,
  },
  scrollPicker: {
    flex: 1,
  },
  pickerItem: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    height: 40, // Fixed height for consistent scrolling
  },
  pickerItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: theme.dark ? '#374151' : '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default CustomDateTimePicker;