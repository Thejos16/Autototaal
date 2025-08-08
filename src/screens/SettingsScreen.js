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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { buildRDWQuery, getRDWHeaders } from '../config/api';

const SettingsScreen = () => {
  const { colors, theme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  
  // Onderhoud tracking state
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    kenteken: '',
    handelsbenaming: '',
    apkDatum: '',
    apkDagenOver: 0,
  });
  const [tempVehicleData, setTempVehicleData] = useState(null);

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
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const addToCalendar = (title, date, description) => {
    const calendarDate = new Date(date);
    calendarDate.setMonth(calendarDate.getMonth() - 1); // 1 maand eerder
    
    const formattedDate = calendarDate.toISOString().split('T')[0];
    const formattedTime = '09:00'; // Standaard tijd
    
    const calendarUrl = `calshow://?title=${encodeURIComponent(title)}&date=${formattedDate}&time=${formattedTime}&notes=${encodeURIComponent(description)}`;
    
    Linking.canOpenURL(calendarUrl).then(supported => {
      if (supported) {
        Linking.openURL(calendarUrl);
      } else {
        Alert.alert('Fout', 'Kan agenda niet openen');
      }
    });
  };

  const formatKenteken = (text) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Format as XX-XX-XX or XX-XXX-X
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5, 6)}`;
    }
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
      alignItems: 'center',
      marginBottom: 16,
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
          {vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleTitle}>{vehicle.handelsbenaming || vehicle.kenteken}</Text>
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
                      {new Date(vehicle.apkDatum).toLocaleDateString('nl-NL')}
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

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => addToCalendar(
                      `APK ${vehicle.handelsbenaming || vehicle.kenteken}`,
                      vehicle.apkDatum,
                      `APK afspraak inplannen voor ${vehicle.handelsbenaming || vehicle.kenteken}`
                    )}
                  >
                    <Text style={styles.buttonText}>APK Reminder toevoegen</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Onderhoud type selector */}
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

              {/* Kilometers onderhoud */}
              {vehicle.onderhoudType === 'kilometers' && (
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
              {vehicle.onderhoudType === 'tijd' && (
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
              {vehicle.onderhoudDatum && (
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
                      `Onderhoud ${vehicle.handelsbenaming || vehicle.kenteken}`,
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