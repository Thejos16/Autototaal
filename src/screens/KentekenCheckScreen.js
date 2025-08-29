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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { buildRDWQuery, buildDefectsQuery, buildFuelsQuery, buildDefectCodesQuery, getRDWHeaders } from '../config/api';
import { addApkToCalendar } from '../utils/calendar';

const KentekenCheckScreen = () => {
  const { colors } = useTheme();
  const [kenteken, setKenteken] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [defectsData, setDefectsData] = useState(null);
  const [fuelsData, setFuelsData] = useState(null);
  const [defectCodesData, setDefectCodesData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showBuyingInfoOverlay, setShowBuyingInfoOverlay] = useState(false);
  const [showDefectsOverlay, setShowDefectsOverlay] = useState(false);

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
      paddingRight: 60, // Space for search icon
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
    inputContainer: {
      position: 'relative',
      marginBottom: -10,
    },
    searchIcon: {
      position: 'absolute',
      right: 20,
      top: '50%',
      transform: [{ translateY: -12 }],
      zIndex: 1,
      marginTop: -5,
      justifyContent: 'center',
      alignItems: 'center',
      height: 24,
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
      flex: 0.65,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      flex: 0.35,
      textAlign: 'right',
    },
    infoValueText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
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
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 32,
      marginTop: -10,
    },
    clearRecentButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
    buyingInfoCard: {
      backgroundColor: '#e8f5e8',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#00aa65',
      borderLeftWidth: 4,
      borderLeftColor: '#00aa65',
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
    // Overlay styling
    overlayContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center', // Center vertically
      alignItems: 'center',
    },
    overlayContent: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      marginVertical: 5, // Very small margin top and bottom
      marginHorizontal: 10, // Small margin left and right
      height: '90%', // Perfect height - not too big, not too small
      width: '95%', // Keep wide width
      minHeight: 500, // Increased minimum height
    },
    overlayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    overlayTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 24,
      color: colors.textSecondary,
      fontWeight: 'bold',
    },
    overlayScrollView: {
      flex: 1,
      minHeight: 100, // Ensure scrollview has minimum height
      maxHeight: '100%', // Use all available height
    },
    // Action buttons styling
    actionButtonsContainer: {
      marginTop: 20,
    },
    actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    actionButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    // Defects styling with timeline
    defectItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
      marginLeft: 20, // Space for timeline
    },
    timelineLine: {
      position: 'absolute',
      left: -10,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: colors.primary,
    },
    timelineDot: {
      position: 'absolute',
      left: -16,
      top: 20,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.background,
    },
    defectDate: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      marginLeft: 8, // Space from timeline
    },
    defectCode: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 4,
      marginLeft: 8, // Space from timeline
    },
    defectDescription: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      marginLeft: 8, // Space from timeline
    },
    noDefectsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 20,
    },
    spacer: {
      height: 16,
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

  // Load defect codes on component mount
  useEffect(() => {
    loadDefectCodes();
  }, []);

  const loadDefectCodes = async () => {
    try {
      const defectCodesQueryUrl = buildDefectCodesQuery();
      console.log('Defect Codes Query URL:', defectCodesQueryUrl);
      
      const defectCodesResponse = await fetch(defectCodesQueryUrl, {
        method: 'GET',
        headers: getRDWHeaders(),
      });
      
      if (defectCodesResponse.ok) {
        const defectCodesData = await defectCodesResponse.json();
        console.log('Defect codes response data length:', defectCodesData.length);
        
        // Create a lookup object for faster access
        const defectCodesLookup = {};
        defectCodesData.forEach(code => {
          if (code.gebrek_identificatie) {
            defectCodesLookup[code.gebrek_identificatie] = code.gebrek_omschrijving;
          }
        });
        
        setDefectCodesData(defectCodesLookup);
        console.log('Defect codes lookup created with', Object.keys(defectCodesLookup).length, 'codes');
      }
    } catch (error) {
      console.error('Error fetching defect codes:', error);
    }
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
            console.log('Defects data length:', defectsData ? defectsData.length : 0);
            setDefectsData(defectsData || []);
          } else {
            console.error('Defects response not ok:', defectsResponse.status);
            setDefectsData([]);
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
    if (!handelsbenaming) return formatBrandName(merk) || 'Niet beschikbaar';
    if (!merk) return formatBrandName(handelsbenaming);
    
    console.log('=== DEBUG formatHandelsbenaming ===');
    console.log('Original merk:', merk);
    console.log('Original handelsbenaming:', handelsbenaming);
    
    // Normaliseer beide strings voor vergelijking
    const normalizeString = (str) => {
      return str.toLowerCase().trim().replace(/\s+/g, ' ');
    };
    
    const normalizedMerk = normalizeString(merk);
    const normalizedHandelsbenaming = normalizeString(handelsbenaming);
    
    console.log('Normalized merk:', normalizedMerk);
    console.log('Normalized handelsbenaming:', normalizedHandelsbenaming);
    
    // Check of merk voorkomt in handelsbenaming
    if (normalizedHandelsbenaming.includes(normalizedMerk)) {
      // Verwijder merknaam uit handelsbenaming
      const modelOnly = normalizedHandelsbenaming.replace(normalizedMerk, '').trim();
      console.log('Model only after replace:', modelOnly);
      
      // Als er nog iets over is, formatteer het
      if (modelOnly) {
        const result = formatBrandName(modelOnly);
        console.log('Final result:', result);
        return result;
      } else {
        // Als er niets over is, toon alleen merk
        const result = formatBrandName(merk);
        console.log('Only merk result:', result);
        return result;
      }
    }
    
    // Als merk niet voorkomt in handelsbenaming, toon alleen handelsbenaming
    // Dit is het geval bij Volvo waar handelsbenaming al alleen "V60" is
    const result = formatBrandName(handelsbenaming);
    console.log('Handelsbenaming only result:', result);
    return result;
  };

  const formatBrandName = (brandName) => {
    if (!brandName) return '';
    
    // Converteer naar lowercase en split op woorden
    const words = brandName.toLowerCase().split(' ');
    
    // Capitalize eerste letter van elk woord
    const formattedWords = words.map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    return formattedWords.join(' ');
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

  // Helper function to get defect description from code
  const getDefectDescription = (defectCode) => {
    console.log('getDefectDescription called with:', defectCode);
    console.log('defectCodesData available:', !!defectCodesData);
    console.log('defectCodesData keys count:', defectCodesData ? Object.keys(defectCodesData).length : 0);
    
    if (!defectCodesData || !defectCode) {
      console.log('Returning default description');
      return 'Onbekende gebreken';
    }
    
    const description = defectCodesData[defectCode];
    console.log('Found description for code', defectCode, ':', description);
    
    return description || `Gebreken ${defectCode}`;
  };

  // Helper function to format defect date
  const formatDefectDate = (dateString) => {
    if (!dateString) return 'Onbekende datum';
    
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
          // Format: "20241025" -> "25/10/2024"
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          const day = dateString.substring(6, 8);
          return `${day}/${month}/${year}`;
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return 'Ongeldige datum';
      }
      
      return date.toLocaleDateString('nl-NL');
    } catch (error) {
      return 'Ongeldige datum';
    }
  };

  // Helper function to group defects by date
  const groupDefectsByDate = (defects) => {
    if (!defects || !Array.isArray(defects)) {
      console.log('groupDefectsByDate: defects is not an array:', defects);
      return [];
    }
    
    console.log('groupDefectsByDate: processing', defects.length, 'defects');
    
    const grouped = {};
    defects.forEach((defect, index) => {
      console.log(`Defect ${index}:`, defect);
      const date = defect.meld_datum_door_keuringsinstantie;
      console.log(`Defect ${index} date:`, date);
      console.log(`Defect ${index} formatted date:`, formatDefectDate(date));
      if (date) {
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(defect);
      }
    });
    
    console.log('Grouped defects:', grouped);
    
    // Convert to array and sort by date (newest first)
    const result = Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        // Parse YYYYMMDD format for comparison
        const parseDate = (dateStr) => {
          if (dateStr && dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6));
            const day = parseInt(dateStr.substring(6, 8));
            return new Date(year, month - 1, day); // month - 1 because JS months are 0-based
          }
          return new Date(dateStr);
        };
        
        const dateA_parsed = parseDate(dateA);
        const dateB_parsed = parseDate(dateB);
        
        return dateB_parsed - dateA_parsed; // Newest first
      })
      .map(([date, defects]) => ({ date, defects }));
    
    console.log('Final grouped result:', result);
    return result;
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
          {vehicleData ? (
            // Toon zoek icoontje in invoerveld wanneer resultaten beschikbaar zijn
            <View style={styles.inputContainer}>
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
                style={styles.searchIcon}
                onPress={searchVehicle}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons name="search" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // Toon normale invoerveld en zoeken knop op eerste pagina
            <>
              <TextInput
                style={[styles.kentekenInput, { paddingRight: 20 }]}
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
            </>
          )}

          {/* Action Buttons - Only show when vehicle data is available */}
          {vehicleData && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowBuyingInfoOverlay(true)}
              >
                <Text style={styles.actionButtonText}>Handige koop informatie</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowDefectsOverlay(true)}
              >
                <Text style={styles.actionButtonText}>Gemelde gebreken</Text>
              </TouchableOpacity>
            </View>
          )}
          
        
      
        </View>

        {/* Recent Searches Section */}
        {recentSearches.length > 0 && !vehicleData && (
          <View style={styles.recentSearchesSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Recent bekeken</Text>
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
            
            
            {/* Algemene voertuiginformatie */}
            <View style={styles.segmentCard}>
              <Text style={styles.segmentTitle}>Algemene voertuiginformatie</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Merk:</Text>
                <Text style={styles.infoValue}>{formatBrandName(vehicleData.merk) || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model:</Text>
                <Text style={styles.infoValue}>
                  {formatHandelsbenaming(vehicleData.merk, vehicleData.handelsbenaming)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Catalogusprijs:</Text>
                <Text style={styles.infoValue}>{formatPrice(vehicleData.catalogusprijs)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vermogen:</Text>
                <View style={styles.infoValue}>
                  {fuelsData && fuelsData.nettomaximumvermogen ? (
                    <>
                      <Text style={styles.infoValueText}>{Math.round(fuelsData.nettomaximumvermogen * 1.36)} PK</Text>
                      <Text style={[styles.infoValueText, { fontSize: styles.infoValueText.fontSize * 0.9, fontWeight: 'normal' }]}>({Math.round(fuelsData.nettomaximumvermogen)} kW)</Text>
                    </>
                  ) : (
                    <Text style={styles.infoValueText}>Niet beschikbaar</Text>
                  )}
                </View>
              </View>

              <View style={styles.spacer} />
              <View style={styles.spacer} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Voertuigsoort:</Text>
                <Text style={styles.infoValue}>{vehicleData.voertuigsoort || 'Niet beschikbaar'}</Text>
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
                <Text style={styles.infoLabel}>Kleur:</Text>
                <Text style={styles.infoValue}>{vehicleData.eerste_kleur || 'Niet beschikbaar'}</Text>
              </View>
              
              {/* Witregel voor visuele scheiding */}
              <View style={styles.spacer} />
              <View style={styles.spacer} />
              
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

            {/* Nieuwe zoekopdracht knop */}
            <TouchableOpacity 
              style={styles.newSearchButton}
              onPress={handleNewSearch}
            >
              <Text style={styles.newSearchButtonText}>Nieuw kenteken zoeken</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Buying Info Overlay */}
        <Modal
          visible={showBuyingInfoOverlay}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBuyingInfoOverlay(false)}
        >

          <View style={styles.overlayContainer}>
            <View style={styles.overlayContent}>
              <View style={styles.overlayHeader}>
                <Text style={styles.overlayTitle}>Handige informatie bij kopen</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowBuyingInfoOverlay(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.overlayScrollView} showsVerticalScrollIndicator={false}>
                {vehicleData ? (
                  <View style={styles.buyingInfoCard}>
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
                ) : (
                  <Text style={styles.noDataText}>
                    Geen voertuiggegevens beschikbaar.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Defects Overlay */}
        <Modal
          visible={showDefectsOverlay}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDefectsOverlay(false)}
        >

          <View style={styles.overlayContainer}>
            <View style={styles.overlayContent}>
              <View style={styles.overlayHeader}>
                <Text style={styles.overlayTitle}>Geconstateerde gebreken voor {kenteken}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDefectsOverlay(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.overlayScrollView} showsVerticalScrollIndicator={false}>
                {defectsData && Array.isArray(defectsData) && defectsData.length > 0 ? (
                  <View>
                    <Text style={[styles.noDefectsText, { fontSize: 12, marginBottom: 10 }]}>
                      Debug: Found {defectsData.length} defects, first defect keys: {defectsData[0] ? Object.keys(defectsData[0]).join(', ') : 'none'}
                    </Text>
                    {defectsData[0] && (
                      <Text style={[styles.noDefectsText, { fontSize: 12, marginBottom: 10 }]}>
                        Sample defect: gebrek_identificatie={defectsData[0].gebrek_identificatie}, meld_datum={defectsData[0].meld_datum_door_keuringsinstantie}
                      </Text>
                    )}
                    {groupDefectsByDate(defectsData).map((group, groupIndex) => (
                      <View key={groupIndex} style={styles.defectItem}>
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineDot} />
                        <Text style={styles.defectDate}>{formatDefectDate(group.date)}</Text>
                        {group.defects.map((defect, defectIndex) => (
                          <View key={defectIndex} style={{ marginBottom: defectIndex < group.defects.length - 1 ? 12 : 0 }}>
                            <Text style={styles.defectCode}>Gebreken: {defect.gebrek_identificatie}</Text>
                            <Text style={styles.defectDescription}>
                              {getDefectDescription(defect.gebrek_identificatie)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.noDefectsText}>
                      Geen gebreken geconstateerd bij (APK) keuring of verplicht onderhoud.
                    </Text>
                    <Text style={[styles.noDefectsText, { fontSize: 12, marginTop: 10 }]}>
                      Debug: defectsData type: {typeof defectsData}, length: {defectsData ? defectsData.length : 'null'}
                    </Text>
                    {defectsData && Array.isArray(defectsData) && defectsData.length === 0 && (
                      <Text style={[styles.noDefectsText, { fontSize: 12, marginTop: 5 }]}>
                        Array is empty - no defects found for this kenteken
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KentekenCheckScreen; 