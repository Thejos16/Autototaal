import { Alert, Platform, Linking } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as IntentLauncher from 'expo-intent-launcher';

function parsePossibleDate(input) {
  if (!input) return null;
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  if (typeof input === 'string') {
    if (input.includes('T')) return new Date(input);
    if (input.includes('-')) return new Date(`${input}T00:00:00`);
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

async function ensureCalendarPermissions() {
  try {
    if (Calendar.requestCalendarWriteOnlyPermissionsAsync) {
      const writeOnly = await Calendar.requestCalendarWriteOnlyPermissionsAsync();
      if (writeOnly?.status === 'granted') return true;
    }

    const full = await Calendar.requestCalendarPermissionsAsync();
    return full?.status === 'granted';
  } catch (e) {
    return false;
  }
}

export async function addApkToCalendar(apkDate, title, description, onSuccess = null) {
  console.log('addApkToCalendar called with:', { apkDate, title, description });
  
  const baseDate = parsePossibleDate(apkDate);
  if (!baseDate || isNaN(baseDate.getTime())) {
    console.log('Invalid date:', apkDate);
    Alert.alert('Fout', 'Ongeldige APK-datum, kan geen agenda-afspraak maken.');
    return;
  }

  // 1 maand voor vervaldatum om 09:00, duur 15 min
  const eventStart = new Date(baseDate.getTime());
  eventStart.setMonth(eventStart.getMonth() - 1);
  eventStart.setHours(9, 0, 0, 0);
  const eventEnd = new Date(eventStart.getTime() + 15 * 60 * 1000);

  console.log('Event details:', { eventStart, eventEnd, platform: Platform.OS });

  // Request permissions first
  console.log('Requesting calendar permissions...');
  const granted = await ensureCalendarPermissions();
  if (!granted) {
    console.log('Permissions denied');
    Alert.alert('Toestemming vereist', 'Geef agendatoegang om een afspraak toe te voegen.');
    return;
  }

  try {
    if (Platform.OS === 'android') {
      console.log('Android: Creating event directly without opening calendar...');
      
      // Get writable calendar for Android too
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      console.log('Android: Found calendars:', calendars.length);
      
      const writableCalendar = calendars.find(cal => 
        cal.allowsModifications && 
        (cal.accessLevel === 'owner' || cal.accessLevel === 'contributor')
      ) || calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!writableCalendar) {
        throw new Error('No writable calendar found');
      }
      
      console.log('Android: Creating event in calendar:', writableCalendar.title);
      
      // Create the event
      const eventId = await Calendar.createEventAsync(writableCalendar.id, {
        title: title || 'APK inplannen',
        notes: description || '',
        startDate: eventStart,
        endDate: eventEnd,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      
      console.log('Android: Event created with ID:', eventId);
      
      // Show success message (same as iOS)
      const eventDateFormatted = eventStart.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      });
      
      Alert.alert(
        '✅ APK Reminder Toegevoegd!',
        `Je afspraak staat nu in je agenda:\n\n📋 ${title}\n📅 ${eventDateFormatted}\n⏰ 09:00 - 09:15\n\n💡 Je kunt deze vinden in je agenda app.`,
        [
          {
            text: 'Perfect!',
            style: 'default'
          }
        ]
      );
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      return;
    }

    // iOS: Simple approach - create event and show in agenda
    console.log('iOS: Creating event and opening calendar...');
    
    // Get writable calendar
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    console.log('iOS: Found calendars:', calendars.length);
    
    const writableCalendar = calendars.find(cal => 
      cal.allowsModifications && 
      (cal.accessLevel === 'owner' || cal.accessLevel === 'contributor')
    ) || calendars.find(cal => cal.allowsModifications) || calendars[0];
    
    if (!writableCalendar) {
      throw new Error('No writable calendar found');
    }
    
    console.log('iOS: Creating event in calendar:', writableCalendar.title);
    
    // Create the event
    const eventId = await Calendar.createEventAsync(writableCalendar.id, {
      title: title || 'APK inplannen',
      notes: description || '',
      startDate: eventStart,
      endDate: eventEnd,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    
    console.log('iOS: Event created with ID:', eventId);
    
    // Don't open calendar app anymore - just create event
    console.log('iOS: Event created successfully, not opening calendar app');
    
    // Show success message with clear instructions
    const eventDateFormatted = eventStart.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
    
    Alert.alert(
      '✅ APK Reminder Toegevoegd!',
      `Je afspraak staat nu in je agenda:\n\n📋 ${title}\n📅 ${eventDateFormatted}\n⏰ 09:00 - 09:15\n\n💡 Je kunt deze vinden in je agenda app.`,
      [
        {
          text: 'Perfect!',
          style: 'default'
        }
      ]
    );
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }
    return;
    
  } catch (e) {
    console.log('Error in calendar flow:', e);
    
    // Final fallback: just open calendar app and show instructions
    try {
      console.log('Fallback: Opening calendar app with instructions...');
      await Linking.openURL('calshow:');
      
      const eventDateStr = eventStart.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      Alert.alert(
        'Agenda geopend',
        `Voeg handmatig deze afspraak toe:\n\nTitel: ${title}\nDatum: ${eventDateStr}\nTijd: 09:00 - 09:15\nBeschrijving: ${description}`,
        [{ text: 'OK' }]
      );
    } catch (linkingError) {
      console.log('Even calendar opening failed:', linkingError);
      Alert.alert('Fout', 'Kon agenda app niet openen. Voeg handmatig een afspraak toe aan je agenda.');
    }
  }
}