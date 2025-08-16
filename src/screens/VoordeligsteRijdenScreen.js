import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { buildFuelsQuery, buildRDWQuery, getRDWHeaders } from '../config/api';

const VoordeligsteRijdenScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [kilometersPerYear, setKilometersPerYear] = useState('');

  
  // Dynamische auto's state
  const [autos, setAutos] = useState([
    {
      id: 1,
      aandrijving: 'Benzine',
      verbruik: '',
      prijs: '',
      inputMode: null, // null, 'manual' or 'kenteken'
      kenteken: '',
      loading: false,
      dataRetrieved: false,
      showDropdown: false
    },
    {
      id: 2,
      aandrijving: 'Benzine',
      verbruik: '',
      prijs: '',
      inputMode: null,
      kenteken: '',
      loading: false,
      dataRetrieved: false,
      showDropdown: false
    }
  ]);

  const aandrijvingOpties = ['Benzine', 'Diesel', 'Elektrisch', 'LPG'];

  // Functie om Nederlandse en internationale decimale notatie te ondersteunen
  const parseDutchFloat = (value) => {
    if (!value) return 0;
    // Vervang komma door punt voor parseFloat
    const normalizedValue = value.replace(',', '.');
    return parseFloat(normalizedValue);
  };

  // Functie om een nieuwe auto toe te voegen
  const addAuto = () => {
    const newId = Math.max(...autos.map(a => a.id)) + 1;
    const newAuto = {
      id: newId,
      aandrijving: 'Benzine',
      verbruik: '',
      prijs: '',
      inputMode: null,
      kenteken: '',
      loading: false,
      dataRetrieved: false,
      showDropdown: false
    };
    setAutos([...autos, newAuto]);
  };

  // Functie om een auto bij te werken
  const updateAuto = (id, updates) => {
    setAutos(prevAutos =>
      prevAutos.map(auto =>
        auto.id === id ? { ...auto, ...updates } : auto
      )
    );
  };

  // Functie om een auto te verwijderen (alleen mogelijk als er meer dan 2 auto's zijn)
  const removeAuto = (id) => {
    if (autos.length > 2) {
      setAutos(prevAutos => prevAutos.filter(auto => auto.id !== id));
    }
  };

  // Functie om voertuiggegevens op te halen via kenteken
  const fetchVehicleData = async (autoId) => {
    const auto = autos.find(a => a.id === autoId);
    if (!auto || !auto.kenteken || auto.kenteken.replace(/-/g, '').length < 6) {
      Alert.alert('Fout', 'Voer een geldig kenteken in (minimaal 6 karakters)');
      return;
    }

    updateAuto(autoId, { loading: true });
    try {
      const cleanKenteken = auto.kenteken.replace(/-/g, '');
      const queryUrl = buildRDWQuery(cleanKenteken);
      
      console.log('Fetching vehicle data for kenteken:', cleanKenteken);
      console.log('Query URL:', queryUrl);
      
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: getRDWHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Vehicle API Response:', data);
      
      if (data && data.length > 0) {
        const vehicleData = data[0];
        console.log('Vehicle data:', vehicleData);
        
        // Nu brandstofgegevens ophalen
        await fetchFuelData(autoId);
      } else {
        updateAuto(autoId, { loading: false });
        Alert.alert('Fout', 'Geen voertuiggegevens gevonden voor dit kenteken.');
      }
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      updateAuto(autoId, { loading: false });
      Alert.alert('Fout', 'Er is een fout opgetreden bij het ophalen van de voertuiggegevens.');
    }
  };

  // Functie om brandstofgegevens op te halen via kenteken
  const fetchFuelData = async (autoId) => {
    const auto = autos.find(a => a.id === autoId);
    if (!auto || !auto.kenteken || auto.kenteken.replace(/-/g, '').length < 6) {
      Alert.alert('Fout', 'Voer een geldig kenteken in (minimaal 6 karakters)');
      return;
    }

    updateAuto(autoId, { loading: true });
    try {
      const cleanKenteken = auto.kenteken.replace(/-/g, '');
      const queryUrl = buildFuelsQuery(cleanKenteken);
      
      console.log('Fetching fuel data for kenteken:', cleanKenteken);
      console.log('Query URL:', queryUrl);
      
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: getRDWHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data && data.length > 0) {
        const fuelData = data[0];
        console.log('Fuel data:', fuelData);
        
        // Brandstof omschrijving mappen naar onze aandrijving opties
        let mappedAandrijving = 'Benzine'; // default
        if (fuelData.brandstof_omschrijving) {
          const brandstof = fuelData.brandstof_omschrijving.toLowerCase();
          console.log('Brandstof omschrijving:', brandstof);
          if (brandstof.includes('diesel')) {
            mappedAandrijving = 'Diesel';
          } else if (brandstof.includes('elektriciteit') || brandstof.includes('elektrisch')) {
            mappedAandrijving = 'Elektrisch';
          } else if (brandstof.includes('lpg')) {
            mappedAandrijving = 'LPG';
          } else {
            mappedAandrijving = 'Benzine';
          }
        }
        
        console.log('Mapped aandrijving:', mappedAandrijving);
        
        // Gecombineerd verbruik instellen - probeer verschillende veldnamen
        let verbruikValue = null;
        
        if (fuelData.brandstofverbruik_gecombineerd) {
          verbruikValue = fuelData.brandstofverbruik_gecombineerd;
          console.log('Brandstofverbruik gecombineerd gevonden:', verbruikValue);
        } else if (fuelData.gecombineerd_verbruik) {
          verbruikValue = fuelData.gecombineerd_verbruik;
          console.log('Gecombineerd verbruik gevonden:', verbruikValue);
        } else if (fuelData.verbruik_gecombineerd) {
          verbruikValue = fuelData.verbruik_gecombineerd;
          console.log('Verbruik gecombineerd gevonden:', verbruikValue);
        }
        
        let cleanVerbruik = '';
        if (verbruikValue) {
          // Zorg ervoor dat we een getal hebben, niet een string met komma's
          cleanVerbruik = verbruikValue.toString().replace(',', '.');
          console.log('Clean verbruik waarde:', cleanVerbruik);
        } else {
          console.log('Geen verbruik gegevens gevonden in:', fuelData);
        }

        // Update auto with retrieved data
        updateAuto(autoId, {
          aandrijving: mappedAandrijving,
          verbruik: cleanVerbruik,
          dataRetrieved: true,
          loading: false
        });
        
        Alert.alert('Succes', 'Voertuiggegevens succesvol opgehaald!');
      } else {
        updateAuto(autoId, { loading: false });
        Alert.alert('Fout', 'Geen voertuiggegevens gevonden voor dit kenteken.');
      }
    } catch (error) {
      console.error('Error fetching fuel data:', error);
      updateAuto(autoId, { loading: false });
      Alert.alert('Fout', 'Er is een fout opgetreden bij het ophalen van de voertuiggegevens.');
    }
  };



  // Functie om te controleren of alle vereiste velden ingevuld zijn
  const isFormComplete = () => {
    // Controleer of kilometers per jaar ingevuld is
    if (!kilometersPerYear) return false;
    
    // Controleer of alle auto's compleet zijn (minimaal 2 auto's)
    if (autos.length < 2) return false;
    
    return autos.every(auto => {
      if (!auto.inputMode) return false;
      
      if (auto.inputMode === 'manual') {
        return auto.verbruik && auto.prijs;
      } else if (auto.inputMode === 'kenteken') {
        return auto.dataRetrieved && auto.verbruik && auto.prijs;
      }
      return false;
    });
  };

  const berekenKosten = () => {
    // Valideer input
    if (!isFormComplete()) {
      Alert.alert('Onvolledige gegevens', 'Vul alle velden in om de berekening uit te voeren.');
      return;
    }

    const kmPerJaar = parseDutchFloat(kilometersPerYear);
    
    // Bereken kosten voor alle auto's
    const autoResultaten = autos.map((auto, index) => {
      const verbruikValue = parseDutchFloat(auto.verbruik);
      const prijsValue = parseDutchFloat(auto.prijs);
      const brandstofKosten = (kmPerJaar / 100) * verbruikValue * prijsValue;
      
      // Debug informatie
      console.log(`Auto ${index + 1} brandstof berekening:`, {
        aandrijving: auto.aandrijving,
        verbruik: verbruikValue,
        prijs: prijsValue,
        brandstofKosten: brandstofKosten
      });
      
      return {
        id: auto.id,
        naam: `Auto ${index + 1}`,
        brandstofKosten,
        totaleKosten: brandstofKosten, // Alleen brandstofkosten
        aandrijving: auto.aandrijving,
        verbruik: verbruikValue,
        prijs: prijsValue
      };
    });

    // Vind de voordeligste auto
    const voordeligsteAuto = autoResultaten.reduce((prev, current) => 
      prev.totaleKosten < current.totaleKosten ? prev : current
    );

    // Bereken verschil met de duurste auto
    const duursteAuto = autoResultaten.reduce((prev, current) => 
      prev.totaleKosten > current.totaleKosten ? prev : current
    );
    
    const verschil = duursteAuto.totaleKosten - voordeligsteAuto.totaleKosten;

    const resultaten = {
      autos: autoResultaten,
      voordeligste: voordeligsteAuto.naam,
      voordeligsteId: voordeligsteAuto.id,
      verschil,
      kilometersPerYear: kmPerJaar
    };

    // Navigeer naar resultaatscherm
    navigation.navigate('VoordeligsteRijdenResult', { resultaten });
  };

  const Dropdown = ({ visible, onClose, options, onSelect, selectedValue }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.dropdownContainer, { backgroundColor: colors.card }]}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dropdownItem,
                selectedValue === option && { backgroundColor: colors.primary + '20' }
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                { color: colors.text },
                selectedValue === option && { color: colors.primary, fontWeight: '600' }
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 20,
    },
    kilometersSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
      color: colors.text,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    autoSection: {
      marginBottom: 24,
    },
    autoTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    autoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownButton: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    dropdownButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    dropdownArrow: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownContainer: {
      borderRadius: 12,
      padding: 8,
      minWidth: 200,
      maxHeight: 300,
    },
    dropdownItem: {
      padding: 16,
      borderRadius: 8,
    },
    dropdownItemText: {
      fontSize: 16,
    },
    berekenKnop: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    berekenKnopDisabled: {
      backgroundColor: colors.primary + '40', // 40% opacity voor lichtblauw effect
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    berekenKnopText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: 'bold',
    },
    berekenKnopTextDisabled: {
      color: colors.background + 'CC', // Lichtere kleur voor disabled text
      fontSize: 18,
      fontWeight: 'bold',
    },
    autoToevoegenKnop: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    autoToevoegenKnopText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    autoRemoveButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: colors.error,
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    autoRemoveButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
    resultatenContainer: {
      marginTop: 20,
      padding: 15,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultatenTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    resultatenRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    resultatenLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    resultatenValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    resultatenDivider: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    stepIndicator: {
      flexDirection: 'row',
      marginBottom: 30,
      justifyContent: 'center',
    },
    stepDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginHorizontal: 4,
    },
    stepDotActive: {
      backgroundColor: colors.primary,
    },
    stepDotInactive: {
      backgroundColor: colors.border,
    },
    inputModeContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 10,
    },
    inputModeButton: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    inputModeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    inputModeButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    inputModeButtonTextActive: {
      color: colors.background,
      fontWeight: '600',
    },
    kentekenContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    searchButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButtonText: {
      fontSize: 18,
      color: colors.background,
    },
    retrievedDataContainer: {
      backgroundColor: colors.primary + '10',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    retrievedDataText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    retrievedDataField: {
      backgroundColor: colors.primary + '10',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      margin: 20,
      maxHeight: '80%',
      minWidth: 300,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalScrollView: {
      maxHeight: 300,
    },
    modalOption: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.background,
    },
    modalOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    modalOptionTextSelected: {
      color: colors.primary,
      fontWeight: 'bold',
    },

  });

  const getVerbruikLabel = (aandrijving) => {
    return aandrijving === 'Elektrisch' ? 'kWh per 100 km' : 'Liter per 100 km';
  };

  const getPrijsLabel = (aandrijving) => {
    if (aandrijving === 'Elektrisch') {
      return 'Prijs per kWh (€)';
    } else if (aandrijving === 'Diesel') {
      return 'Diesel prijs per liter (€)';
    } else if (aandrijving === 'LPG') {
      return 'LPG prijs per liter (€)';
    } else {
      return 'Benzine prijs per liter (€)';
    }
  };

  const getPrijsPlaceholder = (aandrijving) => {
    if (aandrijving === 'Elektrisch') {
      return '0.25';
    } else if (aandrijving === 'Diesel') {
      return '1.45';
    } else if (aandrijving === 'LPG') {
      return '0.70';
    } else {
      return '1.65';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.stepDot,
                currentStep >= stepNumber ? styles.stepDotActive : styles.stepDotInactive
              ]}
            />
          ))}
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Voordeligste Rijden</Text>
          <Text style={styles.subtitle}>
            Bepaal de goedkoopste methode om te rijden door twee auto's te vergelijken
          </Text>
        </View>

        {/* Kilometers per jaar */}
        <View style={styles.kilometersSection}>
          <Text style={styles.sectionTitle}>Kilometers per jaar</Text>
          <Text style={styles.inputLabel}>Hoeveel kilometer rijd je per jaar?</Text>
          <TextInput
            style={styles.input}
            value={kilometersPerYear}
            onChangeText={setKilometersPerYear}
            placeholder="Bijv. 15000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>



        {/* Dynamische Auto's */}
        {autos.map((auto, index) => (
          <View key={auto.id} style={styles.autoSection}>
            <Text style={styles.autoTitle}>Auto {index + 1}</Text>
            <View style={[styles.autoCard, { position: 'relative' }]}>
              {/* Remove button - alleen zichtbaar als er meer dan 2 auto's zijn */}
              {autos.length > 2 && (
                <TouchableOpacity
                  style={styles.autoRemoveButton}
                  onPress={() => removeAuto(auto.id)}
                >
                  <Text style={styles.autoRemoveButtonText}>×</Text>
                </TouchableOpacity>
              )}

              {/* Input Mode Buttons */}
              <Text style={styles.inputLabel}>Kies een invoermethode:</Text>
              <View style={styles.inputModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.inputModeButton,
                    auto.inputMode === 'manual' && styles.inputModeButtonActive
                  ]}
                  onPress={() => {
                    updateAuto(auto.id, {
                      inputMode: 'manual',
                      dataRetrieved: false,
                      verbruik: '',
                      aandrijving: 'Benzine'
                    });
                  }}
                >
                  <Text style={[
                    styles.inputModeButtonText,
                    auto.inputMode === 'manual' && styles.inputModeButtonTextActive
                  ]}>
                    Handmatige Invoer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.inputModeButton,
                    auto.inputMode === 'kenteken' && styles.inputModeButtonActive
                  ]}
                  onPress={() => {
                    updateAuto(auto.id, {
                      inputMode: 'kenteken',
                      dataRetrieved: false,
                      verbruik: '',
                      aandrijving: 'Benzine'
                    });
                  }}
                >
                  <Text style={[
                    styles.inputModeButtonText,
                    auto.inputMode === 'kenteken' && styles.inputModeButtonTextActive
                  ]}>
                    Kenteken Check
                  </Text>
                </TouchableOpacity>
              </View>

              {auto.inputMode === 'manual' && (
                <>
                  {/* Aandrijving Dropdown */}
                  <Text style={styles.inputLabel}>Aandrijving</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => updateAuto(auto.id, { showDropdown: true })}
                  >
                    <Text style={styles.dropdownButtonText}>{auto.aandrijving}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>



                  {/* Verbruik Input */}
                  <Text style={styles.inputLabel}>{getVerbruikLabel(auto.aandrijving)}</Text>
                  <TextInput
                    style={styles.input}
                    value={auto.verbruik}
                    onChangeText={(value) => updateAuto(auto.id, { verbruik: value })}
                    placeholder={`Bijv. ${auto.aandrijving === 'Elektrisch' ? '15' : '6.5'}`}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </>
              )}

              {auto.inputMode === 'kenteken' && (
                <>
                  {/* Kenteken Input */}
                  <Text style={styles.inputLabel}>Kenteken</Text>
                  <View style={styles.kentekenContainer}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 10 }]}
                      value={auto.kenteken}
                      onChangeText={(value) => updateAuto(auto.id, { kenteken: value })}
                      placeholder="Bijv. AB-12-CD"
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={styles.searchButton}
                      onPress={() => fetchVehicleData(auto.id)}
                      disabled={auto.loading}
                    >
                      {auto.loading ? (
                        <ActivityIndicator color={colors.background} size="small" />
                      ) : (
                        <Text style={styles.searchButtonText}>🔍</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  {/* Opgehaalde gegevens - alleen zichtbaar na het ophalen */}
                  {auto.dataRetrieved && (
                    <>
                      <Text style={styles.inputLabel}>Aandrijving</Text>
                      <View style={styles.retrievedDataField}>
                        <Text style={styles.retrievedDataText}>
                          {auto.aandrijving}
                        </Text>
                      </View>


                      
                      <Text style={styles.inputLabel}>{getVerbruikLabel(auto.aandrijving)}</Text>
                      <View style={styles.retrievedDataField}>
                        <Text style={styles.retrievedDataText}>
                          {auto.verbruik}
                        </Text>
                      </View>
                    </>
                  )}
                </>
              )}

              {/* Prijs Input - alleen zichtbaar na het ophalen van gegevens of bij handmatige invoer */}
              {(auto.inputMode === 'manual' || (auto.inputMode === 'kenteken' && auto.dataRetrieved)) && (
                <>
                  <Text style={styles.inputLabel}>{getPrijsLabel(auto.aandrijving)}</Text>
                  <TextInput
                    style={styles.input}
                    value={auto.prijs}
                    onChangeText={(value) => updateAuto(auto.id, { prijs: value })}
                    placeholder={getPrijsPlaceholder(auto.aandrijving)}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </>
              )}
            </View>
          </View>
        ))}

        {/* Auto Toevoegen Knop */}
        <TouchableOpacity
          style={styles.autoToevoegenKnop}
          onPress={addAuto}
        >
          <Text style={styles.autoToevoegenKnopText}>
            + Auto Toevoegen
          </Text>
        </TouchableOpacity>

        {/* Bereken Knop - altijd zichtbaar, styling afhankelijk van of alles ingevuld is */}
        <TouchableOpacity
          style={isFormComplete() ? styles.berekenKnop : styles.berekenKnopDisabled}
          onPress={berekenKosten}
        >
          <Text style={isFormComplete() ? styles.berekenKnopText : styles.berekenKnopTextDisabled}>
            Bereken Jaarlijkse Kosten
          </Text>
        </TouchableOpacity>

        {/* Dynamische Dropdown Modals */}
        {autos.map((auto) => (
          <Dropdown
            key={`dropdown-${auto.id}`}
            visible={auto.showDropdown}
            onClose={() => updateAuto(auto.id, { showDropdown: false })}
            options={aandrijvingOpties}
            onSelect={(value) => updateAuto(auto.id, { aandrijving: value })}
            selectedValue={auto.aandrijving}
          />
        ))}


      </ScrollView>
    </SafeAreaView>
  );
};

export default VoordeligsteRijdenScreen;
