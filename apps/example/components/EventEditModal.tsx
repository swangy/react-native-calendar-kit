import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Event</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, styles.saveButton]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor="#999"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Event description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* All Day Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={styles.label}>All Day Event</Text>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isAllDay ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Start Date/Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Start {isAllDay ? 'Date' : 'Date & Time'}</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => {
                  console.log('Start date picker pressed');
                  setShowStartDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              
              {!isAllDay && (
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => {
                    console.log('Start time picker pressed');
                    setShowStartTimePicker(true);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* End Date/Time */}
          <View style={styles.section}>
            <Text style={styles.label}>End {isAllDay ? 'Date' : 'Date & Time'}</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => {
                  console.log('End date picker pressed');
                  setShowEndDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
              
              {!isAllDay && (
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => {
                    console.log('End time picker pressed');
                    setShowEndTimePicker(true);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recurrence */}
          <View style={styles.section}>
            <Text style={styles.label}>Repeat</Text>
            <View style={styles.recurrenceContainer}>
              {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as RecurrenceType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.recurrenceOption,
                    recurrenceOptions.type === type && styles.recurrenceOptionSelected
                  ]}
                  onPress={() => setRecurrenceOptions(prev => ({ ...prev, type }))}
                >
                  <Text style={[
                    styles.recurrenceOptionText,
                    recurrenceOptions.type === type && styles.recurrenceOptionTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Weekly options */}
            {recurrenceOptions.type === 'weekly' && (
              <View style={styles.weekDaysContainer}>
                <Text style={styles.weekDaysLabel}>Days of week:</Text>
                <View style={styles.weekDaysRow}>
                  {weekDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.weekDayButton,
                        recurrenceOptions.daysOfWeek.includes(index) && styles.weekDayButtonSelected
                      ]}
                      onPress={() => toggleDayOfWeek(index)}
                    >
                      <Text style={[
                        styles.weekDayText,
                        recurrenceOptions.daysOfWeek.includes(index) && styles.weekDayTextSelected
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
              <View style={styles.intervalContainer}>
                <Text style={styles.intervalLabel}>Every</Text>
                <TextInput
                  style={styles.intervalInput}
                  value={recurrenceOptions.interval.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text, 10);
                    if (!isNaN(value) && value > 0) {
                      setRecurrenceOptions(prev => ({ ...prev, interval: value }));
                    }
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.intervalText}>
                  {recurrenceOptions.type === 'daily' ? 'day(s)' :
                   recurrenceOptions.type === 'weekly' ? 'week(s)' :
                   recurrenceOptions.type === 'monthly' ? 'month(s)' : 'year(s)'}
                </Text>
              </View>
            )}
          </View>

          {/* Delete Button */}
          {event?.id && onDelete && (
            <View style={styles.section}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={styles.deleteButtonText}>Delete Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Date/Time Pickers - Simplified */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              console.log('Start date picker onChange:', event.type, selectedDate);
              if (Platform.OS === 'android') {
                setShowStartDatePicker(false);
              }
              if (selectedDate) {
                setStartDate(selectedDate);
                if (isAllDay) {
                  setEndDate(selectedDate);
                }
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              console.log('End date picker onChange:', event.type, selectedDate);
              if (Platform.OS === 'android') {
                setShowEndDatePicker(false);
              }
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              console.log('Start time picker onChange:', event.type, selectedTime);
              if (Platform.OS === 'android') {
                setShowStartTimePicker(false);
              }
              if (selectedTime) {
                setStartTime(selectedTime);
              }
            }}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              console.log('End time picker onChange:', event.type, selectedTime);
              if (Platform.OS === 'android') {
                setShowEndTimePicker(false);
              }
              if (selectedTime) {
                setEndTime(selectedTime);
              }
            }}
          />
        )}

        {showStartDatePicker && Platform.OS === 'ios' && (
          <View style={{ padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={() => setShowStartDatePicker(false)}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#6366f1',
  },
  saveButton: {
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
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
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#374151',
  },
  recurrenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurrenceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
  },
  recurrenceOptionSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  recurrenceOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  recurrenceOptionTextSelected: {
    color: '#ffffff',
  },
  weekDaysContainer: {
    marginTop: 12,
  },
  weekDaysLabel: {
    fontSize: 14,
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
  },
  weekDayButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  weekDayText: {
    fontSize: 12,
    color: '#374151',
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
    color: '#6b7280',
  },
  intervalInput: {
    width: 60,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 14,
  },
  intervalText: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ffffff',
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
});

export default EventEditModal;
