import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { buildRDWQuery, buildDefectsQuery, buildFuelsQuery, getRDWHeaders } from '../config/api';
import { addApkToCalendar } from '../utils/calendar';

const KentekenCheckScreen = () => {
  const { colors } = useTheme();
  const [kenteken, setKenteken] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [defectsData, setDefectsData] = useState(null);
  const [fuelsData, setFuelsData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

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
    recentSearchesSection: {
      marginBottom: 30,
    },
    recentSearchCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentSearchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    recentSearchTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    recentSearchTimestamp: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    recentSearchInfo: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    clearRecentButton: {
      backgroundColor: colors.error || '#FF4444',
      borderRadius: 8,
      padding: 8,
      marginTop: 8,
    },
    clearRecentButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
    buyingInfoCard: {
      backgroundColor: '#00aa65',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#00aa65',
      borderLeftWidth: 4,
      borderLeftColor: '#00aa65',
      backgroundColor: '#e8f5e8',
    },
    buyingInfoTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#00aa65',
      marginBottom: 16,
    },
    buyingInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    buyingInfoLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    buyingInfoValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
      textAlign: 'right',
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
    setDefectsData(null);
    setFuelsData(null);

    try {
      const cleanKenteken = kenteken.replace(/-/g, '');
      
      // Fetch vehicle data
      const vehicleQueryUrl = buildRDWQuery(cleanKenteken);
      console.log('Searching for kenteken:', cleanKenteken);
      console.log('Vehicle Query URL:', vehicleQueryUrl);
      
      const vehicleResponse = await fetch(vehicleQueryUrl, {
        method: 'GET',
        headers: getRDWHeaders(),
      });

      if (!vehicleResponse.ok) {
        const errorText = await vehicleResponse.text();
        console.error('Vehicle response error text:', errorText);
        throw new Error(`HTTP error! status: ${vehicleResponse.status}, message: ${errorText}`);
      }

      const vehicleData = await vehicleResponse.json();
      console.log('Vehicle response data:', vehicleData);
      
      if (vehicleData && vehicleData.length > 0) {
        console.log('Found vehicle data:', vehicleData[0]);
        console.log('Available fields:', Object.keys(vehicleData[0]));
        
        // Debug: Log specifieke velden voor koopinformatie
        const buyingInfoFields = [
          'jaar_laatste_registratie_tellerstand',
          'tellerstandoordeel', 
          'export_indicator',
          'plaats_chassisnummer',
          'wacht_op_keuren',
          'bruto_bpm',
          'netto_bpm',
          'bpm_tarief'
        ];
        
        console.log('Buying info fields:');
        buyingInfoFields.forEach(field => {
          console.log(`${field}:`, vehicleData[0][field]);
        });
        
        setVehicleData(vehicleData[0]);
        
        // Fetch defects data
        try {
          const defectsQueryUrl = buildDefectsQuery(cleanKenteken);
          console.log('Defects Query URL:', defectsQueryUrl);
          
          const defectsResponse = await fetch(defectsQueryUrl, {
            method: 'GET',
            headers: getRDWHeaders(),
          });
          
          if (defectsResponse.ok) {
            const defectsData = await defectsResponse.json();
            console.log('Defects response data:', defectsData);
            if (defectsData && defectsData.length > 0) {
              setDefectsData(defectsData[0]);
            }
          }
        } catch (defectsError) {
          console.error('Error fetching defects data:', defectsError);
        }
        
        // Fetch fuels data
        try {
          const fuelsQueryUrl = buildFuelsQuery(cleanKenteken);
          console.log('Fuels Query URL:', fuelsQueryUrl);
          
          const fuelsResponse = await fetch(fuelsQueryUrl, {
            method: 'GET',
            headers: getRDWHeaders(),
          });
          
          if (fuelsResponse.ok) {
            const fuelsData = await fuelsResponse.json();
            console.log('Fuels response data:', fuelsData);
            if (fuelsData && fuelsData.length > 0) {
              setFuelsData(fuelsData[0]);
            }
          }
        } catch (fuelsError) {
          console.error('Error fetching fuels data:', fuelsError);
        }
        
        // Sla de zoekopdracht op
        await saveRecentSearch(vehicleData[0]);
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
    
    try {
      let date;
      if (typeof dateString === 'string') {
        if (dateString.includes('T')) {
          // ISO format: "2024-10-25T00:00:00.000"
          date = new Date(dateString);
        } else if (dateString.includes('-')) {
          // Date format: "2024-10-25"
          date = new Date(dateString + 'T00:00:00');
        } else if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
          // Format: "20190801" -> "2019-08-01"
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          const day = dateString.substring(6, 8);
          date = new Date(`${year}-${month}-${day}T00:00:00`);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return 'Ongeldige datum';
      }
      
      return date.toLocaleDateString('nl-NL');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Ongeldige datum';
    }
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

  // Functies voor laatste gezochte resultaten
  const saveRecentSearch = async (searchData) => {
    try {
      const existingSearches = await AsyncStorage.getItem('recentKentekenSearches');
      let searches = existingSearches ? JSON.parse(existingSearches) : [];
      
      // Verwijder als deze kenteken al bestaat
      searches = searches.filter(search => search.kenteken !== searchData.kenteken);
      
      // Voeg nieuwe zoekopdracht toe aan het begin
      searches.unshift({
        kenteken: searchData.kenteken,
        handelsbenaming: searchData.handelsbenaming,
        merk: searchData.merk,
        timestamp: new Date().toISOString(),
        data: searchData
      });
      
      // Beperk tot 5 resultaten
      searches = searches.slice(0, 5);
      
      await AsyncStorage.setItem('recentKentekenSearches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentKentekenSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentKentekenSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  // Load recent searches on component mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Reset screen when coming back to it
  useFocusEffect(
    React.useCallback(() => {
      // Reset kenteken input and vehicle data when screen comes into focus
      setKenteken('');
      setVehicleData(null);
    }, [])
  );

  const addToCalendar = (title, date, description) => {
    addApkToCalendar(date, title, description);
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

        {/* Recent Searches Section */}
        {recentSearches.length > 0 && !vehicleData && (
          <View style={styles.recentSearchesSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Laatste gezochte kentekens</Text>
              <TouchableOpacity
                style={styles.clearRecentButton}
                onPress={clearRecentSearches}
              >
                <Text style={styles.clearRecentButtonText}>Wissen</Text>
              </TouchableOpacity>
            </View>
            
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchCard}
                onPress={() => {
                  setKenteken(search.kenteken);
                  setVehicleData(search.data);
                }}
              >
                <View style={styles.recentSearchHeader}>
                  <Text style={styles.recentSearchTitle}>
                    {search.kenteken} - {search.handelsbenaming || search.merk}
                  </Text>
                  <Text style={styles.recentSearchTimestamp}>
                    {new Date(search.timestamp).toLocaleDateString('nl-NL')}
                  </Text>
                </View>
                <Text style={styles.recentSearchInfo}>
                  {search.merk} • {search.data.voertuigsoort || 'Onbekend'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results Section */}
        {vehicleData && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Voertuig Informatie</Text>
            
            {/* Nieuwe API test velden */}
            {(defectsData || fuelsData) && (
              <View style={styles.segmentCard}>
                <Text style={styles.segmentTitle}>API Test Resultaten</Text>
                
                {defectsData && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Meld tijd door keuringsinstantie:</Text>
                    <Text style={styles.infoValue}>
                      {defectsData.meld_tijd_door_keuringsinstantie || 'Niet beschikbaar'}
                    </Text>
                  </View>
                )}
                
                {fuelsData && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Netto maximum vermogen:</Text>
                    <Text style={styles.infoValue}>
                      {fuelsData.nettomaximumvermogen ? `${fuelsData.nettomaximumvermogen} kW` : 'Niet beschikbaar'}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
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

            {/* Handige informatie bij kopen */}
            <View style={styles.buyingInfoCard}>
              <Text style={styles.buyingInfoTitle}>Handige informatie bij kopen</Text>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>Jaar laatste registratie tellerstand:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.jaar_laatste_registratie_tellerstand || 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>Tellerstandoordeel:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.tellerstandoordeel || 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>Export indicator:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.export_indicator || 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>Plaats chassisnummer:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.plaats_chassisnummer || 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>Wacht op keuren:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.wacht_op_keuren || 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>Bruto BPM:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.bruto_bpm ? `€${parseInt(vehicleData.bruto_bpm).toLocaleString('nl-NL')}` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>Netto BPM:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.netto_bpm ? `€${parseInt(vehicleData.netto_bpm).toLocaleString('nl-NL')}` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.buyingInfoRow}>
                <Text style={styles.buyingInfoLabel}>BPM tarief:</Text>
                <Text style={styles.buyingInfoValue}>
                  {vehicleData.bpm_tarief || 'Niet beschikbaar'}
                </Text>
              </View>
            </View>

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