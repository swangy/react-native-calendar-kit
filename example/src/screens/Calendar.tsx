import { EventItem, TimelineCalendar } from '@howljs/calendar-kit';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

const fetchData = (props: { from: string; to: string }) =>
  new Promise<EventItem[]>((resolve) => {
    //Fake api
    setTimeout(() => {
      console.log(props);
      resolve([]);
    }, 1000);
  });

const Calendar = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const numOfDays = 7;
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(new Date().getDate() + numOfDays);
    fetchData({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    })
      .then((res) => {
        setEvents((prev) => [...prev, ...res]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const _onDateChanged = (date: string) => {
    setIsLoading(true);
    const numOfDays = 7;
    const fromDate = new Date(date);
    const toDate = new Date(date);
    toDate.setDate(toDate.getDate() + numOfDays);
    fetchData({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    })
      .then((res) => {
        setEvents((prev) => [...prev, ...res]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TimelineCalendar
        viewMode="week"
        events={events}
        isLoading={isLoading}
        onDateChanged={_onDateChanged}
        theme={{ loadingBarColor: '#D61C4E' }}
      />
    </SafeAreaView>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
});
