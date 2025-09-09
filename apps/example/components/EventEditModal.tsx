import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import CustomDateTimePicker from './CustomDateTimePicker';
import type { EventItem, DateOrDateTime } from '@howljs/calendar-kit';

interface EventEditModalProps {
  visible: boolean;
  event: EventItem | null;
  onClose: () => void;
  onSave: (event: EventItem) => void;
  onDelete?: (eventId: string) => void;
}

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RecurrenceOptions {
  type: RecurrenceType;
  interval: number;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  endDate?: Date;
  count?: number;
}

const EventEditModal: React.FC<EventEditModalProps> = ({
  visible,
  event,
  onClose,
  onSave,
  onDelete,
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [recurrenceOptions, setRecurrenceOptions] = useState<RecurrenceOptions>({
    type: 'none',
    interval: 1,
    daysOfWeek: [],
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      
      // Parse start date/time
      if (event.start.dateTime) {
        const start = new Date(event.start.dateTime);
        setStartDate(start);
        setStartTime(start);
        setIsAllDay(false);
      } else if (event.start.date) {
        const start = new Date(event.start.date);
        setStartDate(start);
        setStartTime(start);
        setIsAllDay(true);
      }

      // Parse end date/time
      if (event.end.dateTime) {
        const end = new Date(event.end.dateTime);
        setEndDate(end);
        setEndTime(end);
      } else if (event.end.date) {
        const end = new Date(event.end.date);
        setEndDate(end);
        setEndTime(end);
      }

      // Parse recurrence
      if (event.recurrence) {
        const recurrence = parseRecurrenceRule(event.recurrence);
        setRecurrenceOptions(recurrence);
      } else {
        setRecurrenceOptions({
          type: 'none',
          interval: 1,
          daysOfWeek: [],
        });
      }
    }
  }, [event]);

  const parseRecurrenceRule = (rule: string): RecurrenceOptions => {
    // Simple parser for common RRULE patterns
    const options: RecurrenceOptions = {
      type: 'none',
      interval: 1,
      daysOfWeek: [],
    };

    if (rule.includes('FREQ=DAILY')) {
      options.type = 'daily';
    } else if (rule.includes('FREQ=WEEKLY')) {
      options.type = 'weekly';
      // Parse BYDAY
      const byDayMatch = rule.match(/BYDAY=([^;]+)/);
      if (byDayMatch) {
        const days = byDayMatch[1].split(',');
        options.daysOfWeek = days.map(day => {
          const dayMap: { [key: string]: number } = {
            'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
          };
          return dayMap[day] || 0;
        });
      }
    } else if (rule.includes('FREQ=MONTHLY')) {
      options.type = 'monthly';
    } else if (rule.includes('FREQ=YEARLY')) {
      options.type = 'yearly';
    }

    // Parse INTERVAL
    const intervalMatch = rule.match(/INTERVAL=(\d+)/);
    if (intervalMatch) {
      options.interval = parseInt(intervalMatch[1], 10);
    }

    return options;
  };

  const generateRecurrenceRule = (options: RecurrenceOptions): string | undefined => {
    if (options.type === 'none') return undefined;

    let rule = `FREQ=${options.type.toUpperCase()}`;
    
    if (options.interval > 1) {
      rule += `;INTERVAL=${options.interval}`;
    }

    if (options.type === 'weekly' && options.daysOfWeek.length > 0) {
      const dayMap: { [key: number]: string } = {
        0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA'
      };
      const days = options.daysOfWeek.map(day => dayMap[day]).join(',');
      rule += `;BYDAY=${days}`;
    }

    return rule;
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the event');
      return;
    }

    if (startDate >= endDate && !isAllDay) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    const recurrenceRule = generateRecurrenceRule(recurrenceOptions);
    
    const updatedEvent: EventItem = {
      ...event!,
      id: event?.id || `event_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      recurrence: recurrenceRule,
      start: isAllDay 
        ? { date: startDate.toISOString().split('T')[0] }
        : { 
            dateTime: new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate(),
              startTime.getHours(),
              startTime.getMinutes()
            ).toISOString()
          },
      end: isAllDay
        ? { date: endDate.toISOString().split('T')[0] }
        : { 
            dateTime: new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate(),
              endTime.getHours(),
              endTime.getMinutes()
            ).toISOString()
          },
    };

    onSave(updatedEvent);
    onClose();
  };

  const handleDelete = () => {
    if (event?.id && onDelete) {
      Alert.alert(
        'Delete Event',
        'Are you sure you want to delete this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              onDelete(event.id);
              onClose();
            }
          }
        ]
      );
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setRecurrenceOptions(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const dynamicStyles = getStyles(theme);

  if (!visible) return null;

  return (
    <View style={dynamicStyles.overlay}>
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={onClose} style={dynamicStyles.headerButton}>
            <Text style={dynamicStyles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Edit Event</Text>
          <TouchableOpacity onPress={handleSave} style={dynamicStyles.headerButton}>
            <Text style={[dynamicStyles.headerButtonText, dynamicStyles.saveButton]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false} bounces={false}>
          {/* Title */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.label}>Title *</Text>
            <TextInput
              style={dynamicStyles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor={theme.dark ? "#999" : "#666"}
            />
          </View>

          {/* Description */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.label}>Description</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Event description"
              placeholderTextColor={theme.dark ? "#999" : "#666"}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* All Day Toggle */}
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.toggleRow}>
              <Text style={dynamicStyles.label}>All Day Event</Text>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isAllDay ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Start Date/Time */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.label}>Start {isAllDay ? 'Date' : 'Date & Time'}</Text>
            <View style={dynamicStyles.dateTimeRow}>
              <TouchableOpacity
                style={dynamicStyles.dateTimeButton}
                onPress={() => {
                  console.log('Start date picker pressed');
                  setShowStartDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={dynamicStyles.dateTimeText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              
              {!isAllDay && (
                <TouchableOpacity
                  style={dynamicStyles.dateTimeButton}
                  onPress={() => {
                    console.log('Start time picker pressed');
                    setShowStartTimePicker(true);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={dynamicStyles.dateTimeText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* End Date/Time */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.label}>End {isAllDay ? 'Date' : 'Date & Time'}</Text>
            <View style={dynamicStyles.dateTimeRow}>
              <TouchableOpacity
                style={dynamicStyles.dateTimeButton}
                onPress={() => {
                  console.log('End date picker pressed');
                  setShowEndDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={dynamicStyles.dateTimeText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
              
              {!isAllDay && (
                <TouchableOpacity
                  style={dynamicStyles.dateTimeButton}
                  onPress={() => {
                    console.log('End time picker pressed');
                    setShowEndTimePicker(true);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={dynamicStyles.dateTimeText}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recurrence */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.label}>Repeat</Text>
            <View style={dynamicStyles.recurrenceContainer}>
              {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as RecurrenceType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    dynamicStyles.recurrenceOption,
                    recurrenceOptions.type === type && dynamicStyles.recurrenceOptionSelected
                  ]}
                  onPress={() => setRecurrenceOptions(prev => ({ ...prev, type }))}
                >
                  <Text style={[
                    dynamicStyles.recurrenceOptionText,
                    recurrenceOptions.type === type && dynamicStyles.recurrenceOptionTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Weekly options */}
            {recurrenceOptions.type === 'weekly' && (
              <View style={dynamicStyles.weekDaysContainer}>
                <Text style={dynamicStyles.weekDaysLabel}>Days of week:</Text>
                <View style={dynamicStyles.weekDaysRow}>
                  {weekDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        dynamicStyles.weekDayButton,
                        recurrenceOptions.daysOfWeek.includes(index) && dynamicStyles.weekDayButtonSelected
                      ]}
                      onPress={() => toggleDayOfWeek(index)}
                    >
                      <Text style={[
                        dynamicStyles.weekDayText,
                        recurrenceOptions.daysOfWeek.includes(index) && dynamicStyles.weekDayTextSelected
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Interval */}
            {recurrenceOptions.type !== 'none' && (
              <View style={dynamicStyles.intervalContainer}>
                <Text style={dynamicStyles.intervalLabel}>Every</Text>
                <TextInput
                  style={dynamicStyles.intervalInput}
                  value={recurrenceOptions.interval.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text, 10);
                    if (!isNaN(value) && value > 0) {
                      setRecurrenceOptions(prev => ({ ...prev, interval: value }));
                    }
                  }}
                  keyboardType="numeric"
                />
                <Text style={dynamicStyles.intervalText}>
                  {recurrenceOptions.type === 'daily' ? 'day(s)' :
                  recurrenceOptions.type === 'weekly' ? 'week(s)' :
                  recurrenceOptions.type === 'monthly' ? 'month(s)' : 'year(s)'}
                </Text>
              </View>
            )}
          </View>

          {/* Delete Button */}
          {event?.id && onDelete && (
            <View style={dynamicStyles.section}>
              <TouchableOpacity style={dynamicStyles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={dynamicStyles.deleteButtonText}>Delete Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>


        {/* Custom Date Time Pickers - Pure React Native */}
        <CustomDateTimePicker
          isVisible={showStartDatePicker}
          mode="date"
          date={startDate}
          onConfirm={(date) => {
            setStartDate(date);
            setShowStartDatePicker(false);
          }}
          onCancel={() => setShowStartDatePicker(false)}
          title="Pick a start date"
        />

        <CustomDateTimePicker
          isVisible={showEndDatePicker}
          mode="date"
          date={endDate}
          minimumDate={startDate}
          onConfirm={(date) => {
            setEndDate(date);
            setShowEndDatePicker(false);
          }}
          onCancel={() => setShowEndDatePicker(false)}
          title="Pick an end date"
        />

        <CustomDateTimePicker
          isVisible={showStartTimePicker}
          mode="time"
          date={startTime}
          onConfirm={(time) => {
            setStartTime(time);
            setShowStartTimePicker(false);
          }}
          onCancel={() => setShowStartTimePicker(false)}
          title="Pick a start time"
        />

        <CustomDateTimePicker
          isVisible={showEndTimePicker}
          mode="time"
          date={endTime}
          onConfirm={(time) => {
            setEndTime(time);
            setShowEndTimePicker(false);
          }}
          onCancel={() => setShowEndTimePicker(false)}
          title="Pick an end time"
        />

      </SafeAreaView>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.card,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  saveButton: {
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurrenceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
  },
  recurrenceOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  recurrenceOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  recurrenceOptionTextSelected: {
    color: '#ffffff',
  },
  weekDaysContainer: {
    marginTop: 12,
  },
  weekDaysLabel: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  weekDayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
  },
  weekDayButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  weekDayText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  weekDayTextSelected: {
    color: '#ffffff',
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  intervalLabel: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  intervalInput: {
    width: 60,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.text,
  },
  intervalText: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EventEditModal;
