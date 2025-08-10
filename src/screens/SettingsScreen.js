import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Switch,
  Linking,
  Alert,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { buildRDWQuery, getRDWHeaders } from '../config/api';
import { addApkToCalendar } from '../utils/calendar';

const SettingsScreen = () => {
  const { colors, theme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  
  // Logo beheer systeem - hier kun je alle logo's toevoegen
  const vehicleLogos = {
    // Voeg hier je logo's toe in het formaat: 'handelsbenaming': require('../assets/logos/logo-naam.png')
    // Voorbeeld:
    // 'BMW 3 Serie': require('../assets/logos/bmw-3-serie.png'),
    // 'Mercedes C-Klasse': require('../assets/logos/mercedes-c-klasse.png'),
    // 'Audi A4': require('../assets/logos/audi-a4.png'),
  };
  
  // Functie om het juiste logo te vinden op basis van handelsbenaming
  const getVehicleLogo = (handelsbenaming) => {
    return vehicleLogos[handelsbenaming] || null;
  };
  
  // Onderhoud tracking state
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    kenteken: '',
    handelsbenaming: '',
    apkDatum: '',
    apkDagenOver: 0,
    agendaToegevoegd: false,
  });
  const [tempVehicleData, setTempVehicleData] = useState(null);
  
  // State voor onderhoud reminder toggle per voertuig
  const [showOnderhoudOptions, setShowOnderhoudOptions] = useState({});

  const themeOptions = [
    { key: 'light', label: 'Licht', description: 'Altijd lichte achtergrond' },
    { key: 'dark', label: 'Donker', description: 'Altijd donkere achtergrond' },
    { key: 'system', label: 'Systeem', description: 'Volgt je apparaat instellingen' },
  ];

  const handlePushNotificationToggle = (value) => {
    if (value && !pushNotificationsEnabled) {
      // Als we notificaties willen inschakelen, open dan iOS instellingen
      Alert.alert(
        'Notificaties Inschakelen',
        'Om notificaties te ontvangen, moet je deze eerst inschakelen in je iPhone instellingen.',
        [
          {
            text: 'Annuleren',
            style: 'cancel',
          },
          {
            text: 'Instellingen Openen',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
    } else {
      setPushNotificationsEnabled(value);
    }
  };

  // Helper functies voor onderhoud tracking
  const fetchVehicleData = async (kenteken) => {
    try {
      const cleanKenteken = kenteken.replace(/-/g, '');
      const queryUrl = buildRDWQuery(cleanKenteken);
      
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: getRDWHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      return null;
    }
  };

  const calculateDaysDifference = (dateString) => {
    if (!dateString) return 0;
    
    try {
      let targetDate;
      if (typeof dateString === 'string') {
        if (dateString.includes('T')) {
          // ISO format: "2024-10-25T00:00:00.000"
          targetDate = new Date(dateString);
        } else if (dateString.includes('-')) {
          // Date format: "2024-10-25"
          targetDate = new Date(dateString + 'T00:00:00');
        } else if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
          // Format: "20231011" -> "2023-10-11"
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          const day = dateString.substring(6, 8);
          targetDate = new Date(`${year}-${month}-${day}T00:00:00`);
        } else {
          targetDate = new Date(dateString);
        }
      } else {
        targetDate = new Date(dateString);
      }
      
      if (isNaN(targetDate.getTime())) {
        console.warn('Invalid date format:', dateString);
        return 0;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      targetDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.warn('Error calculating days difference:', error);
      return 0;
    }
  };

  const addToCalendar = (title, date, description, vehicleIndex) => {
    addApkToCalendar(date, title, description, () => {
      // Mark as added to calendar
      setVehicles(prevVehicles => {
        const updatedVehicles = [...prevVehicles];
        if (updatedVehicles[vehicleIndex]) {
          updatedVehicles[vehicleIndex] = {
            ...updatedVehicles[vehicleIndex],
            agendaToegevoegd: true
          };
          // Save to AsyncStorage
          AsyncStorage.setItem('savedVehicles', JSON.stringify(updatedVehicles));
        }
        return updatedVehicles;
      });
    });
  };

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

  const handleKentekenChange = async (vehicleId, text) => {
    const formattedKenteken = formatKenteken(text);
    
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === vehicleId) {
        return { ...vehicle, kenteken: formattedKenteken };
      }
      return vehicle;
    });
    setVehicles(updatedVehicles);

    // Fetch vehicle data if kenteken is complete
    if (formattedKenteken.replace(/-/g, '').length >= 6) {
      const vehicleData = await fetchVehicleData(formattedKenteken);
      if (vehicleData) {
        const updatedVehiclesWithData = vehicles.map(vehicle => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              handelsbenaming: vehicleData.handelsbenaming || '',
              apkDatum: vehicleData.vervaldatum_apk_dt || '',
              apkDagenOver: calculateDaysDifference(vehicleData.vervaldatum_apk_dt),
            };
          }
          return vehicle;
        });
        setVehicles(updatedVehiclesWithData);
      }
    }
  };

  const handleAddVehicle = () => {
    setShowAddVehicleModal(true);
    setNewVehicle({
      kenteken: '',
      handelsbenaming: '',
      apkDatum: '',
      apkDagenOver: 0,
    });
    setTempVehicleData(null);
  };

  const handleNewVehicleKentekenChange = async (text) => {
    const formattedKenteken = formatKenteken(text);
    setNewVehicle({ ...newVehicle, kenteken: formattedKenteken });

    // Fetch vehicle data if kenteken is complete
    if (formattedKenteken.replace(/-/g, '').length >= 6) {
      const vehicleData = await fetchVehicleData(formattedKenteken);
      if (vehicleData) {
        setTempVehicleData(vehicleData);
        setNewVehicle({
          ...newVehicle,
          kenteken: formattedKenteken,
          handelsbenaming: vehicleData.handelsbenaming || '',
          apkDatum: vehicleData.vervaldatum_apk_dt || '',
          apkDagenOver: calculateDaysDifference(vehicleData.vervaldatum_apk_dt),
        });
      }
    }
  };

  const confirmAddVehicle = () => {
    if (newVehicle.kenteken && newVehicle.handelsbenaming) {
      const vehicleToAdd = {
        id: Date.now(), // Unique ID
        ...newVehicle,
        onderhoudType: 'kilometers',
        kilometersPerYear: '',
        onderhoudDatum: '',
        onderhoudDagenOver: 0,
      };
      const updatedVehicles = [...vehicles, vehicleToAdd];
      setVehicles(updatedVehicles);
      saveVehiclesToStorage(updatedVehicles);
      setShowAddVehicleModal(false);
    }
  };

  const removeVehicle = (vehicleId) => {
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updatedVehicles);
    saveVehiclesToStorage(updatedVehicles);
  };

  // AsyncStorage functies
  const saveVehiclesToStorage = async (vehiclesToSave) => {
    try {
      await AsyncStorage.setItem('userVehicles', JSON.stringify(vehiclesToSave));
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  };

  const loadVehiclesFromStorage = async () => {
    try {
      const savedVehicles = await AsyncStorage.getItem('userVehicles');
      if (savedVehicles) {
        setVehicles(JSON.parse(savedVehicles));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  // Load vehicles on component mount
  useEffect(() => {
    loadVehiclesFromStorage();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    optionContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionInfo: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    currentThemeText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      maxWidth: 400,
      width: '100%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    themeOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedThemeOption: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    themeOptionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    themeOptionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.text,
    },
    confirmButtonText: {
      color: colors.background,
    },
    // Onderhoud tracking styles
    maintenanceSection: {
      marginBottom: 30,
    },
    carCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    carCountLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginRight: 16,
    },
    carCountButtons: {
      flexDirection: 'row',
    },
    carCountButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
    },
    carCountButtonActive: {
      backgroundColor: colors.primary,
    },
    carCountButtonInactive: {
      backgroundColor: colors.border,
    },
    carCountButtonText: {
      fontSize: 18,
      fontWeight: '600',
    },
    carCountButtonTextActive: {
      color: colors.background,
    },
    carCountButtonTextInactive: {
      color: colors.text,
    },
    vehicleCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    vehicleTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    inputField: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
      color: colors.text,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
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
      flex: 1,
      textAlign: 'right',
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    warningText: {
      color: colors.warning,
      fontSize: 14,
      fontWeight: '600',
    },
    successText: {
      color: colors.success || '#4CAF50',
      fontSize: 14,
      fontWeight: '600',
    },
    onderhoudTypeContainer: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    onderhoudTypeButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
    },
    onderhoudTypeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    onderhoudTypeButtonInactive: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    onderhoudTypeButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    onderhoudTypeButtonTextActive: {
      color: colors.background,
    },
    onderhoudTypeButtonTextInactive: {
      color: colors.text,
    },
    vehicleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    vehicleTitleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    vehicleTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 0,
      flex: 1,
    },
    logoPlaceholder: {
      width: 40,
      height: 40,
      backgroundColor: colors.border,
      borderRadius: 8,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    logoPlaceholderText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    vehicleLogo: {
      width: 40,
      height: 40,
      marginRight: 12,
      borderRadius: 8,
    },
    imageUploadSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    imageUploadTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    imageUploadDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    uploadButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    uploadButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '600',
    },
    onderhoudReminderButton: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    onderhoudReminderButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    removeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.error || '#FF4444',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButtonText: {
      color: colors.background,
      fontSize: 20,
      fontWeight: 'bold',
    },
    addVehicleButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    addVehicleButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: '600',
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    statusText: {
      fontSize: 16,
      fontWeight: '600',
    },
    statusYes: {
      color: '#4CAF50',
    },
    statusNo: {
      color: '#FF9800',
    },
    buttonDisabled: {
      backgroundColor: '#CCCCCC',
      opacity: 0.7,
    },
    buttonTextDisabled: {
      color: '#666666',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voorkeuren</Text>
          
          {/* Theme Selection */}
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Thema</Text>
                <Text style={styles.optionDescription}>
                  Kies je voorkeur voor licht of donker thema
                </Text>
              </View>
              <Text style={styles.currentThemeText}>
                {themeOptions.find(option => option.key === theme)?.label}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Push Notifications */}
          <View style={styles.optionContainer}>
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Push Notificaties</Text>
                <Text style={styles.optionDescription}>
                  Ontvang meldingen over belangrijke updates
                </Text>
              </View>
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={handlePushNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={pushNotificationsEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Onderhoud Tracking Sectie */}
        <View style={styles.maintenanceSection}>
          <Text style={styles.sectionTitle}>Auto Onderhoud</Text>
          
          {/* Voertuig kaarten */}
          {vehicles.map((vehicle, index) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleTitleContainer}>
                  {getVehicleLogo(vehicle.handelsbenaming) ? (
                    <Image 
                      source={getVehicleLogo(vehicle.handelsbenaming)} 
                      style={styles.vehicleLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <TouchableOpacity style={styles.logoPlaceholder}>
                      <Text style={styles.logoPlaceholderText}>Logo</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.vehicleTitle}>{vehicle.handelsbenaming || vehicle.kenteken}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeVehicle(vehicle.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              

              
              {/* Voertuig informatie */}
              {vehicle.handelsbenaming && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kenteken:</Text>
                  <Text style={styles.infoValue}>{vehicle.kenteken}</Text>
                </View>
              )}

              {vehicle.apkDatum && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>APK vervaldatum:</Text>
                    <Text style={styles.infoValue}>
                      {vehicle.apkDatum ? new Date(vehicle.apkDatum).toLocaleDateString('nl-NL') : 'Niet beschikbaar'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dagen tot APK:</Text>
                    <Text style={[
                      styles.infoValue,
                      vehicle.apkDagenOver <= 30 ? styles.warningText : 
                      vehicle.apkDagenOver <= 90 ? styles.successText : 
                      { color: colors.text }
                    ]}>
                      {vehicle.apkDagenOver} dagen
                    </Text>
                  </View>

                  {/* APK Agenda Status */}
                  <View style={styles.statusRow}>
                    <Text style={styles.infoLabel}>Toegevoegd aan agenda:</Text>
                    <Text style={[styles.statusText, vehicle.agendaToegevoegd ? styles.statusYes : styles.statusNo]}>
                      {vehicle.agendaToegevoegd ? 'Ja' : 'Nee'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, vehicle.agendaToegevoegd && styles.buttonDisabled]}
                    onPress={() => !vehicle.agendaToegevoegd && addToCalendar(
                      'APK inplannen',
                      vehicle.apkDatum,
                      `APK afspraak inplannen voor ${vehicle.handelsbenaming || vehicle.kenteken}`,
                      index
                    )}
                    disabled={vehicle.agendaToegevoegd}
                  >
                    <Text style={[styles.buttonText, vehicle.agendaToegevoegd && styles.buttonTextDisabled]}>
                      {vehicle.agendaToegevoegd ? 'APK Reminder toegevoegd ✓' : 'APK Reminder toevoegen'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Onderhoud reminder knop */}
              <TouchableOpacity
                style={styles.onderhoudReminderButton}
                onPress={() => {
                  setShowOnderhoudOptions(prev => ({
                    ...prev,
                    [vehicle.id]: !prev[vehicle.id]
                  }));
                }}
              >
                <Text style={styles.onderhoudReminderButtonText}>
                  {showOnderhoudOptions[vehicle.id] ? 'Onderhoud Opties Verbergen' : 'Onderhoud Reminder'}
                </Text>
              </TouchableOpacity>

              {/* Onderhoud type selector - alleen zichtbaar na klikken op reminder knop */}
              {showOnderhoudOptions[vehicle.id] && (
                <View style={styles.onderhoudTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.onderhoudTypeButton,
                      vehicle.onderhoudType === 'kilometers' 
                        ? styles.onderhoudTypeButtonActive 
                        : styles.onderhoudTypeButtonInactive
                    ]}
                    onPress={() => {
                      const updatedVehicles = vehicles.map(v => 
                        v.id === vehicle.id 
                          ? { ...v, onderhoudType: 'kilometers' }
                          : v
                      );
                      setVehicles(updatedVehicles);
                      saveVehiclesToStorage(updatedVehicles);
                    }}
                  >
                    <Text style={[
                      styles.onderhoudTypeButtonText,
                      vehicle.onderhoudType === 'kilometers' 
                        ? styles.onderhoudTypeButtonTextActive 
                        : styles.onderhoudTypeButtonTextInactive
                    ]}>
                      Kilometers
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.onderhoudTypeButton,
                      vehicle.onderhoudType === 'tijd' 
                        ? styles.onderhoudTypeButtonActive 
                        : styles.onderhoudTypeButtonInactive
                    ]}
                    onPress={() => {
                      const updatedVehicles = vehicles.map(v => 
                        v.id === vehicle.id 
                          ? { ...v, onderhoudType: 'tijd' }
                          : v
                      );
                      setVehicles(updatedVehicles);
                      saveVehiclesToStorage(updatedVehicles);
                    }}
                  >
                    <Text style={[
                      styles.onderhoudTypeButtonText,
                      vehicle.onderhoudType === 'tijd' 
                        ? styles.onderhoudTypeButtonTextActive 
                        : styles.onderhoudTypeButtonTextInactive
                    ]}>
                      Tijdsperiode
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Kilometers onderhoud */}
              {showOnderhoudOptions[vehicle.id] && vehicle.onderhoudType === 'kilometers' && (
                <>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Kilometers per jaar"
                    value={vehicle.kilometersPerYear}
                    onChangeText={(text) => {
                      const updatedVehicles = vehicles.map(v => 
                        v.id === vehicle.id 
                          ? { ...v, kilometersPerYear: text }
                          : v
                      );
                      setVehicles(updatedVehicles);
                      saveVehiclesToStorage(updatedVehicles);
                    }}
                    keyboardType="numeric"
                  />
                  
                  {vehicle.kilometersPerYear && (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => {
                        // Bereken onderhoud datum op basis van kilometers
                        const kmPerYear = parseInt(vehicle.kilometersPerYear);
                        const onderhoudInterval = 15000; // 15.000 km onderhoud interval
                        const daysUntilOnderhoud = Math.ceil((onderhoudInterval / kmPerYear) * 365);
                        
                        const onderhoudDate = new Date();
                        onderhoudDate.setDate(onderhoudDate.getDate() + daysUntilOnderhoud);
                        
                        const updatedVehicles = vehicles.map(v => 
                          v.id === vehicle.id 
                            ? { 
                                ...v, 
                                onderhoudDatum: onderhoudDate.toISOString().split('T')[0],
                                onderhoudDagenOver: daysUntilOnderhoud
                              }
                            : v
                        );
                        setVehicles(updatedVehicles);
                        saveVehiclesToStorage(updatedVehicles);
                      }}
                    >
                      <Text style={styles.buttonText}>Bereken onderhoud datum</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Tijdsperiode onderhoud */}
              {showOnderhoudOptions[vehicle.id] && vehicle.onderhoudType === 'tijd' && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    // Hier zou je een datum picker kunnen toevoegen
                    // Voor nu gebruiken we een standaard interval van 12 maanden
                    const onderhoudDate = new Date();
                    onderhoudDate.setMonth(onderhoudDate.getMonth() + 12);
                    
                    const updatedVehicles = vehicles.map(v => 
                      v.id === vehicle.id 
                        ? { 
                            ...v, 
                            onderhoudDatum: onderhoudDate.toISOString().split('T')[0],
                            onderhoudDagenOver: 365
                          }
                        : v
                    );
                    setVehicles(updatedVehicles);
                    saveVehiclesToStorage(updatedVehicles);
                  }}
                >
                  <Text style={styles.buttonText}>Stel onderhoud datum in (12 maanden)</Text>
                </TouchableOpacity>
              )}

              {/* Onderhoud informatie */}
              {showOnderhoudOptions[vehicle.id] && vehicle.onderhoudDatum && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Verwachte onderhoud:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(vehicle.onderhoudDatum).toLocaleDateString('nl-NL')}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dagen tot onderhoud:</Text>
                    <Text style={[
                      styles.infoValue,
                      vehicle.onderhoudDagenOver <= 30 ? styles.warningText : 
                      vehicle.onderhoudDagenOver <= 90 ? styles.successText : 
                      { color: colors.text }
                    ]}>
                      {vehicle.onderhoudDagenOver} dagen
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => addToCalendar(
                      'Onderhoud inplannen',
                      vehicle.onderhoudDatum,
                      `Onderhoud afspraak inplannen voor ${vehicle.handelsbenaming || vehicle.kenteken}`
                    )}
                  >
                    <Text style={styles.buttonText}>Onderhoud Reminder toevoegen</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}

          {/* Auto toevoegen knop */}
          <TouchableOpacity
            style={styles.addVehicleButton}
            onPress={handleAddVehicle}
          >
            <Text style={styles.addVehicleButtonText}>+ Auto toevoegen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity activeOpacity={1}>
              <Text style={styles.modalTitle}>Kies Thema</Text>
              
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.themeOption,
                    theme === option.key && styles.selectedThemeOption,
                  ]}
                  onPress={() => {
                    setTheme(option.key);
                    setShowThemeModal(false);
                  }}
                >
                  <Text style={styles.themeOptionText}>{option.label}</Text>
                  <Text style={styles.themeOptionDescription}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowThemeModal(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Annuleren
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddVehicleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddVehicleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddVehicleModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity activeOpacity={1}>
              <Text style={styles.modalTitle}>Auto Toevoegen</Text>
              
              <TextInput
                style={styles.inputField}
                placeholder="Kenteken (bijv. XX-XX-XX)"
                value={newVehicle.kenteken}
                onChangeText={handleNewVehicleKentekenChange}
                autoCapitalize="characters"
                maxLength={8}
              />

              {tempVehicleData && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Voertuig:</Text>
                    <Text style={styles.infoValue}>{tempVehicleData.handelsbenaming}</Text>
                  </View>
                  {tempVehicleData.vervaldatum_apk_dt && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>APK vervaldatum:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(tempVehicleData.vervaldatum_apk_dt).toLocaleDateString('nl-NL')}
                      </Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddVehicleModal(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Annuleren
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmAddVehicle}
                  disabled={!newVehicle.handelsbenaming}
                >
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>
                    Toevoegen
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen; 