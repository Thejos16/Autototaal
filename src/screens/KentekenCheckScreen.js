import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { buildRDWQuery, getRDWHeaders } from '../config/api';

const KentekenCheckScreen = () => {
  const { colors } = useTheme();
  const [kenteken, setKenteken] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    headerSection: {
      marginBottom: 30,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
    },
    inputSection: {
      marginBottom: 30,
    },
    kentekenInput: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.border,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      letterSpacing: 2,
      color: colors.text,
      textTransform: 'uppercase',
    },
    searchButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    searchButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: '600',
    },
    resultsSection: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      flex: 1,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      flex: 2,
      textAlign: 'right',
    },
    newSearchButton: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    newSearchButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 16,
    },
    noDataText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 16,
    },
    // Nieuwe segment styling
    segmentCard: {
      backgroundColor: '#E3F2FD', // Blauwe achtergrond
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#2196F3',
    },
    segmentTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1976D2',
      marginBottom: 16,
    },
  });

  const formatKenteken = (text) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (cleaned.length === 0) return '';
    
    // Nederlandse kenteken formaten
    const patterns = [
      // Sidecode 1: XX-00-00 (twee letters, twee cijfers, twee cijfers)
      { pattern: /^([A-Z]{2})(\d{2})(\d{2})$/, format: '$1-$2-$3' },
      
      // Sidecode 2: 00-00-XX (twee cijfers, twee cijfers, twee letters)
      { pattern: /^(\d{2})(\d{2})([A-Z]{2})$/, format: '$1-$2-$3' },
      
      // Sidecode 3: 00-XX-00 (twee cijfers, twee letters, twee cijfers)
      { pattern: /^(\d{2})([A-Z]{2})(\d{2})$/, format: '$1-$2-$3' },
      
      // Sidecode 4: XX-00-XX (twee letters, twee cijfers, twee letters)
      { pattern: /^([A-Z]{2})(\d{2})([A-Z]{2})$/, format: '$1-$2-$3' },
      
      // Sidecode 5: 00-XX-XX (twee cijfers, twee letters, twee letters)
      { pattern: /^(\d{2})([A-Z]{2})([A-Z]{2})$/, format: '$1-$2-$3' },
      
      // Sidecode 6: XX-XX-00 (twee letters, twee letters, twee cijfers)
      { pattern: /^([A-Z]{2})([A-Z]{2})(\d{2})$/, format: '$1-$2-$3' },
      
      // Sidecode 7: 0-XX-000 (één cijfer, twee letters, drie cijfers)
      { pattern: /^(\d)([A-Z]{2})(\d{3})$/, format: '$1-$2-$3' },
      
      // Sidecode 8: 000-XX-0 (drie cijfers, twee letters, één cijfer)
      { pattern: /^(\d{3})([A-Z]{2})(\d)$/, format: '$1-$2-$3' },
      
      // Sidecode 9: X-000-XX (één letter, drie cijfers, twee letters)
      { pattern: /^([A-Z])(\d{3})([A-Z]{2})$/, format: '$1-$2-$3' },
      
      // Sidecode 10: XX-000-X (twee letters, drie cijfers, één letter)
      { pattern: /^([A-Z]{2})(\d{3})([A-Z])$/, format: '$1-$2-$3' },
      
      // Motorfietsen: M-00-XX (één letter, twee cijfers, twee letters)
      { pattern: /^([A-Z])(\d{2})([A-Z]{2})$/, format: '$1-$2-$3' },
      
      // Bromfietsen Sidecode 1: A0-00-0 (twee letters, twee cijfers, één cijfer)
      { pattern: /^([A-Z]{2})(\d{2})(\d)$/, format: '$1-$2-$3' },
      
      // Bromfietsen Sidecode 2: 0-00-00 (één cijfer, twee cijfers, twee cijfers)
      { pattern: /^(\d)(\d{2})(\d{2})$/, format: '$1-$2-$3' },
    ];
    
    // Probeer elk patroon
    for (const { pattern, format } of patterns) {
      if (pattern.test(cleaned)) {
        return cleaned.replace(pattern, format);
      }
    }
    
    // Als geen patroon past, return de cleaned string
    return cleaned;
  };

  const handleKentekenChange = (text) => {
    const formatted = formatKenteken(text);
    setKenteken(formatted);
  };

  const searchVehicle = async () => {
    if (!kenteken || kenteken.replace(/-/g, '').length < 6) {
      Alert.alert('Fout', 'Voer een geldig kenteken in (minimaal 6 karakters)');
      return;
    }

    setLoading(true);
    setVehicleData(null);

    try {
      const cleanKenteken = kenteken.replace(/-/g, '');
      const queryUrl = buildRDWQuery(cleanKenteken);
      
      console.log('Searching for kenteken:', cleanKenteken);
      console.log('Query URL:', queryUrl);
      
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: getRDWHeaders(),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data && data.length > 0) {
        console.log('Found vehicle data:', data[0]);
        setVehicleData(data[0]);
      } else {
        setVehicleData(null);
        Alert.alert('Geen resultaat', 'Geen voertuig gevonden met dit kenteken.');
      }
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      Alert.alert('Fout', `Er is een fout opgetreden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setKenteken('');
    setVehicleData(null);
  };

  const formatPrice = (price) => {
    if (!price || price === '0') return 'Niet beschikbaar';
    return `€ ${parseInt(price).toLocaleString('nl-NL')}`;
  };

  const formatPower = (power) => {
    if (!power || power === '0') return 'Niet beschikbaar';
    return `${parseFloat(power).toFixed(2)} kW/t`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Niet beschikbaar';
    
    console.log('Formatting date:', dateString);
    
    let date;
    if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        // ISO format: "2024-10-25T00:00:00.000"
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Date format: "2024-10-25"
        date = new Date(dateString + 'T00:00:00');
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    console.log('Parsed date:', date);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Ongeldige datum';
    }
    
    return date.toLocaleDateString('nl-NL');
  };

  const formatHandelsbenaming = (merk, handelsbenaming) => {
    if (!handelsbenaming) return merk || 'Niet beschikbaar';
    if (!merk) return handelsbenaming;
    
    // Haal merknaam uit handelsbenaming als deze erin zit
    const cleanMerk = merk.toLowerCase().trim();
    const cleanHandelsbenaming = handelsbenaming.toLowerCase().trim();
    
    if (cleanHandelsbenaming.includes(cleanMerk)) {
      return handelsbenaming;
    }
    
    return `${merk} ${handelsbenaming}`;
  };

  const calculateTotalPower = (vermogenMassarijklaar, massaRijklaar) => {
    if (!vermogenMassarijklaar || !massaRijklaar || vermogenMassarijklaar === '0' || massaRijklaar === '0') {
      return 'Niet beschikbaar';
    }
    
    const vermogenPerTon = parseFloat(vermogenMassarijklaar);
    const massa = parseFloat(massaRijklaar);
    const totalPower = (vermogenPerTon * massa) / 1000; // kW
    
    return `${totalPower.toFixed(1)} kW`;
  };

  const addToCalendar = (title, date, description) => {
    console.log('Adding to calendar - Original date:', date);
    
    // Parse de datum correct
    let calendarDate;
    if (typeof date === 'string') {
      if (date.includes('T')) {
        // ISO format: "2024-10-25T00:00:00.000"
        calendarDate = new Date(date);
      } else if (date.includes('-')) {
        // Date format: "2024-10-25"
        calendarDate = new Date(date + 'T00:00:00');
      } else {
        calendarDate = new Date();
      }
    } else {
      calendarDate = new Date(date);
    }
    
    console.log('Parsed calendar date:', calendarDate);
    
    // Controleer of de datum geldig is
    if (isNaN(calendarDate.getTime())) {
      Alert.alert('Fout', 'Ongeldige datum voor agenda afspraak');
      return;
    }
    
    // 1 maand eerder
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    calendarDate.setHours(9, 0, 0, 0); // 9:00 uur
    
    console.log('Final calendar date:', calendarDate);
    
    // Format voor iOS Calendar
    const startDate = calendarDate.toISOString();
    const endDate = new Date(calendarDate.getTime() + 15 * 60 * 1000).toISOString(); // 15 minuten later
    
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    
    // iOS Calendar URL
    const calendarUrl = `calshow://?title=${encodeURIComponent(title)}&start=${startDate}&end=${endDate}&notes=${encodeURIComponent(description)}`;
    
    // Fallback voor Android
    const androidCalendarUrl = `content://com.android.calendar/time/${calendarDate.getTime()}`;
    
    console.log('Calendar URL:', calendarUrl);
    
    Linking.canOpenURL(calendarUrl).then(supported => {
      if (supported) {
        Linking.openURL(calendarUrl);
      } else {
        // Probeer Android calendar
        Linking.openURL(androidCalendarUrl).catch(() => {
          Alert.alert('Fout', 'Kan agenda niet openen. Voeg handmatig toe aan je agenda.');
        });
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Kentekencheck</Text>
          <Text style={styles.subtitle}>
            Voer een kenteken in om gedetailleerde informatie over het voertuig te krijgen
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.kentekenInput}
            value={kenteken}
            onChangeText={handleKentekenChange}
            placeholder="Kenteken"
            placeholderTextColor={colors.textSecondary}
            maxLength={10}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={searchVehicle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.searchButtonText}>Zoeken</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {vehicleData && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Voertuig Informatie</Text>
            
            {/* Algemene voertuiginformatie */}
            <View style={styles.segmentCard}>
              <Text style={styles.segmentTitle}>Algemene voertuiginformatie</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kenteken:</Text>
                <Text style={styles.infoValue}>{vehicleData.kenteken}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Merk:</Text>
                <Text style={styles.infoValue}>{vehicleData.merk || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model:</Text>
                <Text style={styles.infoValue}>
                  {formatHandelsbenaming(vehicleData.merk, vehicleData.handelsbenaming)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Voertuigsoort:</Text>
                <Text style={styles.infoValue}>{vehicleData.voertuigsoort || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Eerste kleur:</Text>
                <Text style={styles.infoValue}>{vehicleData.eerste_kleur || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Inrichting:</Text>
                <Text style={styles.infoValue}>{vehicleData.inrichting || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aantal zitplaatsen:</Text>
                <Text style={styles.infoValue}>{vehicleData.aantal_zitplaatsen || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Catalogusprijs:</Text>
                <Text style={styles.infoValue}>{formatPrice(vehicleData.catalogusprijs)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Datum eerste toelating:</Text>
                <Text style={styles.infoValue}>{formatDate(vehicleData.datum_eerste_toelating_dt)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Datum tenaamstelling:</Text>
                <Text style={styles.infoValue}>{formatDate(vehicleData.datum_tenaamstelling)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vervaldatum APK:</Text>
                <Text style={styles.infoValue}>{formatDate(vehicleData.vervaldatum_apk_dt)}</Text>
              </View>
            </View>

            {/* Motor- en prestatiegegevens */}
            <View style={styles.segmentCard}>
              <Text style={styles.segmentTitle}>Motor- en prestatiegegevens</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aantal cilinders:</Text>
                <Text style={styles.infoValue}>{vehicleData.aantal_cilinders || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cilinderinhoud:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.cilinderinhoud ? `${vehicleData.cilinderinhoud} cc` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vermogen/massa rijklaar:</Text>
                <Text style={styles.infoValue}>{formatPower(vehicleData.vermogen_massarijklaar)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Totaal vermogen:</Text>
                <Text style={styles.infoValue}>
                  {calculateTotalPower(vehicleData.vermogen_massarijklaar, vehicleData.massa_rijklaar)}
                </Text>
              </View>
              
                                            <View style={styles.infoRow}>
                 <Text style={styles.infoLabel}>Max. trekkende massa geremd:</Text>
                 <Text style={styles.infoValue}>
                   {vehicleData.aanhangwagen_autonoom_geremd ? `${vehicleData.aanhangwagen_autonoom_geremd} kg` : 'Niet beschikbaar'}
                 </Text>
               </View>
               
               <View style={styles.infoRow}>
                 <Text style={styles.infoLabel}>Max. trekkende massa ongeremd:</Text>
                 <Text style={styles.infoValue}>
                   {vehicleData.aanhangwagen_middenas_geremd ? `${vehicleData.aanhangwagen_middenas_geremd} kg` : 'Niet beschikbaar'}
                 </Text>
               </View>
               
               <View style={styles.infoRow}>
                 <Text style={styles.infoLabel}>Wielbasis:</Text>
                 <Text style={styles.infoValue}>
                   {vehicleData.wielbasis ? `${vehicleData.wielbasis} mm` : 'Niet beschikbaar'}
                 </Text>
               </View>
            </View>

            {/* Afmetingen en gewichten */}
            <View style={styles.segmentCard}>
              <Text style={styles.segmentTitle}>Afmetingen en gewichten</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Massa ledig voertuig:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.massa_ledig_voertuig ? `${vehicleData.massa_ledig_voertuig} kg` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Massa rijklaar:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.massa_rijklaar ? `${vehicleData.massa_rijklaar} kg` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Toegestane max. massa:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.toegestane_maximum_massa_voertuig ? `${vehicleData.toegestane_maximum_massa_voertuig} kg` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Laadvermogen:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.laadvermogen ? `${vehicleData.laadvermogen} kg` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lengte:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.lengte ? `${vehicleData.lengte} mm` : 'Niet beschikbaar'}
                </Text>
              </View>
              
                             <View style={styles.infoRow}>
                 <Text style={styles.infoLabel}>Breedte:</Text>
                 <Text style={styles.infoValue}>
                   {vehicleData.breedte ? `${vehicleData.breedte} mm` : 'Niet beschikbaar'}
                 </Text>
               </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aantal wielen:</Text>
                <Text style={styles.infoValue}>{vehicleData.aantal_wielen || 'Niet beschikbaar'}</Text>
              </View>
            </View>

            {/* APK Reminder knop */}
            {vehicleData.vervaldatum_apk_dt && (
              <TouchableOpacity 
                style={styles.button}
                onPress={() => addToCalendar(
                  `APK ${vehicleData.handelsbenaming || vehicleData.kenteken}`,
                  vehicleData.vervaldatum_apk_dt,
                  `APK afspraak inplannen voor ${vehicleData.handelsbenaming || vehicleData.kenteken}`
                )}
              >
                <Text style={styles.buttonText}>APK Reminder toevoegen</Text>
              </TouchableOpacity>
            )}

            {/* Nieuwe zoekopdracht knop */}
            <TouchableOpacity 
              style={styles.newSearchButton}
              onPress={handleNewSearch}
            >
              <Text style={styles.newSearchButtonText}>Nieuw kenteken zoeken</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default KentekenCheckScreen; 