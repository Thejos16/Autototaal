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
import { buildFuelsQuery, getRDWHeaders } from '../config/api';

const VoordeligsteRijdenScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [kilometersPerYear, setKilometersPerYear] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  
  // Auto 1 state
  const [aandrijving1, setAandrijving1] = useState('Benzine');
  const [verbruik1, setVerbruik1] = useState('');
  const [prijs1, setPrijs1] = useState('');
  const [inputMode1, setInputMode1] = useState(null); // null, 'manual' or 'kenteken'
  const [kenteken1, setKenteken1] = useState('');
  const [loading1, setLoading1] = useState(false);
  const [dataRetrieved1, setDataRetrieved1] = useState(false); // Track if data was retrieved
  
  // Auto 2 state
  const [aandrijving2, setAandrijving2] = useState('Benzine');
  const [verbruik2, setVerbruik2] = useState('');
  const [prijs2, setPrijs2] = useState('');
  const [inputMode2, setInputMode2] = useState(null); // null, 'manual' or 'kenteken'
  const [kenteken2, setKenteken2] = useState('');
  const [loading2, setLoading2] = useState(false);
  const [dataRetrieved2, setDataRetrieved2] = useState(false); // Track if data was retrieved

  const aandrijvingOpties = ['Benzine', 'Diesel', 'Elektrisch', 'LPG'];

  // Functie om Nederlandse en internationale decimale notatie te ondersteunen
  const parseDutchFloat = (value) => {
    if (!value) return 0;
    // Vervang komma door punt voor parseFloat
    const normalizedValue = value.replace(',', '.');
    return parseFloat(normalizedValue);
  };

  // Functie om brandstofgegevens op te halen via kenteken
  const fetchFuelData = async (kenteken, setAandrijving, setVerbruik, setLoading, setDataRetrieved) => {
    if (!kenteken || kenteken.replace(/-/g, '').length < 6) {
      Alert.alert('Fout', 'Voer een geldig kenteken in (minimaal 6 karakters)');
      return;
    }

    setLoading(true);
    try {
      const cleanKenteken = kenteken.replace(/-/g, '');
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
        setAandrijving(mappedAandrijving);
        
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
        
        if (verbruikValue) {
          // Zorg ervoor dat we een getal hebben, niet een string met komma's
          const cleanValue = verbruikValue.toString().replace(',', '.');
          console.log('Clean verbruik waarde:', cleanValue);
          setVerbruik(cleanValue);
        } else {
          console.log('Geen verbruik gegevens gevonden in:', fuelData);
        }
        
        // Mark data as retrieved
        setDataRetrieved(true);
        
        Alert.alert('Succes', 'Voertuiggegevens succesvol opgehaald!');
      } else {
        Alert.alert('Fout', 'Geen voertuiggegevens gevonden voor dit kenteken.');
      }
    } catch (error) {
      console.error('Error fetching fuel data:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden bij het ophalen van de voertuiggegevens.');
    } finally {
      setLoading(false);
    }
  };

  const berekenKosten = () => {
    // Valideer input
    if (!kilometersPerYear || !verbruik1 || !prijs1 || !verbruik2 || !prijs2) {
      alert('Vul alle velden in om de berekening uit te voeren.');
      return;
    }

    const kmPerJaar = parseDutchFloat(kilometersPerYear);
    const verbruik1Value = parseDutchFloat(verbruik1);
    const prijs1Value = parseDutchFloat(prijs1);
    const verbruik2Value = parseDutchFloat(verbruik2);
    const prijs2Value = parseDutchFloat(prijs2);

    // Gecorrigeerde berekening: jaarlijkse kilometers / 100 * liter per 100 km * benzine prijs
    const jaarlijkseKosten1 = (kmPerJaar / 100) * verbruik1Value * prijs1Value;
    const jaarlijkseKosten2 = (kmPerJaar / 100) * verbruik2Value * prijs2Value;

    // Bepaal welke auto voordeliger is
    const verschil = Math.abs(jaarlijkseKosten1 - jaarlijkseKosten2);
    const voordeligste = jaarlijkseKosten1 < jaarlijkseKosten2 ? 'Auto 1' : 'Auto 2';

    const resultaten = {
      auto1: {
        jaarlijkseKosten: jaarlijkseKosten1,
        aandrijving: aandrijving1,
        verbruik: verbruik1Value,
        prijs: prijs1Value
      },
      auto2: {
        jaarlijkseKosten: jaarlijkseKosten2,
        aandrijving: aandrijving2,
        verbruik: verbruik2Value,
        prijs: prijs2Value
      },
      voordeligste,
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
    berekenKnopText: {
      color: colors.background,
      fontSize: 18,
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

        {/* Auto 1 */}
        <View style={styles.autoSection}>
          <Text style={styles.autoTitle}>Auto 1</Text>
          <View style={styles.autoCard}>
            {/* Input Mode Buttons */}
            <Text style={styles.inputLabel}>Kies een invoermethode:</Text>
            <View style={styles.inputModeContainer}>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  inputMode1 === 'manual' && styles.inputModeButtonActive
                ]}
                onPress={() => {
                  setInputMode1('manual');
                  setDataRetrieved1(false);
                  setVerbruik1('');
                  setAandrijving1('Benzine');
                }}
              >
                <Text style={[
                  styles.inputModeButtonText,
                  inputMode1 === 'manual' && styles.inputModeButtonTextActive
                ]}>
                  Handmatige Invoer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  inputMode1 === 'kenteken' && styles.inputModeButtonActive
                ]}
                onPress={() => {
                  setInputMode1('kenteken');
                  setDataRetrieved1(false);
                  setVerbruik1('');
                  setAandrijving1('Benzine');
                }}
              >
                <Text style={[
                  styles.inputModeButtonText,
                  inputMode1 === 'kenteken' && styles.inputModeButtonTextActive
                ]}>
                  Kenteken Check
                </Text>
              </TouchableOpacity>
            </View>

            {inputMode1 === 'manual' && (
              <>
                {/* Aandrijving Dropdown */}
                <Text style={styles.inputLabel}>Aandrijving</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowDropdown1(true)}
                >
                  <Text style={styles.dropdownButtonText}>{aandrijving1}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {/* Verbruik Input */}
                <Text style={styles.inputLabel}>{getVerbruikLabel(aandrijving1)}</Text>
                <TextInput
                  style={styles.input}
                  value={verbruik1}
                  onChangeText={setVerbruik1}
                  placeholder={`Bijv. ${aandrijving1 === 'Elektrisch' ? '15' : '6.5'}`}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </>
            )}

            {inputMode1 === 'kenteken' && (
              <>
                {/* Kenteken Input */}
                <Text style={styles.inputLabel}>Kenteken</Text>
                <View style={styles.kentekenContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    value={kenteken1}
                    onChangeText={setKenteken1}
                    placeholder="Bijv. AB-12-CD"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => fetchFuelData(kenteken1, setAandrijving1, setVerbruik1, setLoading1, setDataRetrieved1)}
                    disabled={loading1}
                  >
                    {loading1 ? (
                      <ActivityIndicator color={colors.background} size="small" />
                    ) : (
                      <Text style={styles.searchButtonText}>🔍</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Opgehaalde gegevens - alleen zichtbaar na het ophalen */}
                {dataRetrieved1 && (
                  <>
                    <Text style={styles.inputLabel}>Aandrijving</Text>
                    <View style={styles.retrievedDataField}>
                      <Text style={styles.retrievedDataText}>
                        {aandrijving1}
                      </Text>
                    </View>
                    
                    <Text style={styles.inputLabel}>{getVerbruikLabel(aandrijving1)}</Text>
                    <View style={styles.retrievedDataField}>
                      <Text style={styles.retrievedDataText}>
                        {verbruik1}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}

            {/* Prijs Input - alleen zichtbaar na het ophalen van gegevens of bij handmatige invoer */}
            {(inputMode1 === 'manual' || (inputMode1 === 'kenteken' && dataRetrieved1)) && (
              <>
                <Text style={styles.inputLabel}>{getPrijsLabel(aandrijving1)}</Text>
                <TextInput
                  style={styles.input}
                  value={prijs1}
                  onChangeText={setPrijs1}
                  placeholder={getPrijsPlaceholder(aandrijving1)}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </>
            )}
          </View>
        </View>

        {/* Auto 2 */}
        <View style={styles.autoSection}>
          <Text style={styles.autoTitle}>Auto 2</Text>
          <View style={styles.autoCard}>
            {/* Input Mode Buttons */}
            <Text style={styles.inputLabel}>Kies een invoermethode:</Text>
            <View style={styles.inputModeContainer}>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  inputMode2 === 'manual' && styles.inputModeButtonActive
                ]}
                onPress={() => {
                  setInputMode2('manual');
                  setDataRetrieved2(false);
                  setVerbruik2('');
                  setAandrijving2('Benzine');
                }}
              >
                <Text style={[
                  styles.inputModeButtonText,
                  inputMode2 === 'manual' && styles.inputModeButtonTextActive
                ]}>
                  Handmatige Invoer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  inputMode2 === 'kenteken' && styles.inputModeButtonActive
                ]}
                onPress={() => {
                  setInputMode2('kenteken');
                  setDataRetrieved2(false);
                  setVerbruik2('');
                  setAandrijving2('Benzine');
                }}
              >
                <Text style={[
                  styles.inputModeButtonText,
                  inputMode2 === 'kenteken' && styles.inputModeButtonTextActive
                ]}>
                  Kenteken Check
                </Text>
              </TouchableOpacity>
            </View>

            {inputMode2 === 'manual' && (
              <>
                {/* Aandrijving Dropdown */}
                <Text style={styles.inputLabel}>Aandrijving</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowDropdown2(true)}
                >
                  <Text style={styles.dropdownButtonText}>{aandrijving2}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {/* Verbruik Input */}
                <Text style={styles.inputLabel}>{getVerbruikLabel(aandrijving2)}</Text>
                <TextInput
                  style={styles.input}
                  value={verbruik2}
                  onChangeText={setVerbruik2}
                  placeholder={`Bijv. ${aandrijving2 === 'Elektrisch' ? '15' : '6.5'}`}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </>
            )}

            {inputMode2 === 'kenteken' && (
              <>
                {/* Kenteken Input */}
                <Text style={styles.inputLabel}>Kenteken</Text>
                <View style={styles.kentekenContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    value={kenteken2}
                    onChangeText={setKenteken2}
                    placeholder="Bijv. AB-12-CD"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => fetchFuelData(kenteken2, setAandrijving2, setVerbruik2, setLoading2, setDataRetrieved2)}
                    disabled={loading2}
                  >
                    {loading2 ? (
                      <ActivityIndicator color={colors.background} size="small" />
                    ) : (
                      <Text style={styles.searchButtonText}>🔍</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Opgehaalde gegevens - alleen zichtbaar na het ophalen */}
                {dataRetrieved2 && (
                  <>
                    <Text style={styles.inputLabel}>Aandrijving</Text>
                    <View style={styles.retrievedDataField}>
                      <Text style={styles.retrievedDataText}>
                        {aandrijving2}
                      </Text>
                    </View>
                    
                    <Text style={styles.inputLabel}>{getVerbruikLabel(aandrijving2)}</Text>
                    <View style={styles.retrievedDataField}>
                      <Text style={styles.retrievedDataText}>
                        {verbruik2}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}

            {/* Prijs Input - alleen zichtbaar na het ophalen van gegevens of bij handmatige invoer */}
            {(inputMode2 === 'manual' || (inputMode2 === 'kenteken' && dataRetrieved2)) && (
              <>
                <Text style={styles.inputLabel}>{getPrijsLabel(aandrijving2)}</Text>
                <TextInput
                  style={styles.input}
                  value={prijs2}
                  onChangeText={setPrijs2}
                  placeholder={getPrijsPlaceholder(aandrijving2)}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </>
            )}
          </View>
        </View>

        {/* Bereken Knop - alleen zichtbaar als alle benodigde velden zijn ingevuld */}
        {inputMode1 && inputMode2 && 
         ((inputMode1 === 'manual' && verbruik1 && prijs1) || 
          (inputMode1 === 'kenteken' && dataRetrieved1 && verbruik1 && prijs1)) &&
         ((inputMode2 === 'manual' && verbruik2 && prijs2) || 
          (inputMode2 === 'kenteken' && dataRetrieved2 && verbruik2 && prijs2)) && (
          <TouchableOpacity
            style={styles.berekenKnop}
            onPress={berekenKosten}
          >
            <Text style={styles.berekenKnopText}>
              Bereken Jaarlijkse Kosten
            </Text>
          </TouchableOpacity>
        )}

        {/* Dropdown Modals */}
        <Dropdown
          visible={showDropdown1}
          onClose={() => setShowDropdown1(false)}
          options={aandrijvingOpties}
          onSelect={setAandrijving1}
          selectedValue={aandrijving1}
        />

        <Dropdown
          visible={showDropdown2}
          onClose={() => setShowDropdown2(false)}
          options={aandrijvingOpties}
          onSelect={setAandrijving2}
          selectedValue={aandrijving2}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default VoordeligsteRijdenScreen;
