import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const BijtellingCheckScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    privateKm: '',
    useKenteken: false,
    catalogusWaarde: '',
    bouwjaar: '',
    aandrijving: '',
    jaarsalaris: '',
    brutoMaandSalaris: '',
    vakantiegeld: false,
    dertiendeMaand: false,
  });

  // Calculation results
  const [results, setResults] = useState({
    bijtellingTarief: 0,
    brutoBijtellingJaar: 0,
    brutoBijtellingMaand: 0,
    nettoBijtellingMaand: 0,
  });

  const aandrijvingOpties = [
    { key: 'elektrisch', label: 'Elektrisch' },
    { key: 'waterstof', label: 'Waterstof' },
    { key: 'benzine', label: 'Benzine' },
    { key: 'diesel', label: 'Diesel' },
  ];

  // Helper function to format numbers with thousands separators
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const resetForm = () => {
    setFormData({
      privateKm: '',
      useKenteken: false,
      catalogusWaarde: '',
      bouwjaar: '',
      aandrijving: '',
      jaarsalaris: '',
      brutoMaandSalaris: '',
      vakantiegeld: false,
      dertiendeMaand: false,
    });
    setResults({
      bijtellingTarief: 0,
      brutoBijtellingJaar: 0,
      brutoBijtellingMaand: 0,
      nettoBijtellingMaand: 0,
    });
    setStep(1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBijtelling = () => {
    const { catalogusWaarde, bouwjaar, aandrijving, jaarsalaris, brutoMaandSalaris, vakantiegeld, dertiendeMaand } = formData;
    
    if (!catalogusWaarde || !bouwjaar || !aandrijving || (!jaarsalaris && !brutoMaandSalaris)) {
      Alert.alert('Fout', 'Vul alle velden in om de berekening te maken.');
      return;
    }

    const catalogusWaardeNum = parseFloat(catalogusWaarde);
    const bouwjaarNum = parseInt(bouwjaar);
    
    // Bereken jaarsalaris - gebruik direct jaarsalaris of bereken van maandsalaris
    let jaarsalarisBerekend = 0;
    if (jaarsalaris) {
      // Direct jaarsalaris ingevoerd
      jaarsalarisBerekend = parseFloat(jaarsalaris);
    } else if (brutoMaandSalaris) {
      // Maandsalaris ingevoerd via rekenhulp
      const maandSalaris = parseFloat(brutoMaandSalaris);
      jaarsalarisBerekend = maandSalaris * 12;
      if (vakantiegeld) jaarsalarisBerekend += maandSalaris * 0.08; // 8% vakantiegeld
      if (dertiendeMaand) jaarsalarisBerekend += maandSalaris; // 13e maand
    }

    // Bepaal bijtellingspercentage op basis van bouwjaar en aandrijving
    let bijtellingsPercentage = 22; // Standaard voor benzine/diesel
    
    if (aandrijving === 'elektrisch' || aandrijving === 'waterstof') {
      if (bouwjaarNum >= 2025) {
        bijtellingsPercentage = 17;
      } else if (bouwjaarNum >= 2023) {
        bijtellingsPercentage = 16;
      } else if (bouwjaarNum >= 2022) {
        bijtellingsPercentage = 16;
      } else if (bouwjaarNum >= 2021) {
        bijtellingsPercentage = 12;
      } else if (bouwjaarNum >= 2020) {
        bijtellingsPercentage = 8;
      }
    }

    // Bereken bruto bijtelling (cataloguswaarde * bijtellingspercentage)
    let brutoBijtelling = 0;
    if (aandrijving === 'elektrisch' && bouwjaarNum >= 2023) {
      // Speciale regeling voor elektrische auto's
      if (catalogusWaardeNum <= 30000) {
        brutoBijtelling = catalogusWaardeNum * (bijtellingsPercentage / 100);
      } else {
        brutoBijtelling = 30000 * (bijtellingsPercentage / 100) + 
                         (catalogusWaardeNum - 30000) * 0.22;
      }
    } else {
      brutoBijtelling = catalogusWaardeNum * (bijtellingsPercentage / 100);
    }

    // Belastingschijven 2025
    const SCHIJF1_GRENS = 38441;
    const SCHIJF2_GRENS = 76817;
    const SCHIJF1_TARIEF = 35.82;
    const SCHIJF2_TARIEF = 37.48;
    const SCHIJF3_TARIEF = 49.50;

    // Bereken netto bijtelling per maand
    // De bijtelling wordt toegevoegd aan het inkomen en dan belast volgens de schijven
    const totaalInkomen = jaarsalarisBerekend + brutoBijtelling;
    let nettoBijtellingJaar = 0;

    if (totaalInkomen <= SCHIJF1_GRENS) {
      // Alles in schijf 1
      nettoBijtellingJaar = brutoBijtelling * (SCHIJF1_TARIEF / 100);
    } else if (totaalInkomen <= SCHIJF2_GRENS) {
      // Gemengde berekening schijf 1 en 2
      const schijf1Deel = Math.max(0, SCHIJF1_GRENS - jaarsalarisBerekend);
      const schijf2Deel = brutoBijtelling - schijf1Deel;
      
      const belastingSchijf1 = schijf1Deel * (SCHIJF1_TARIEF / 100);
      const belastingSchijf2 = schijf2Deel * (SCHIJF2_TARIEF / 100);
      
      nettoBijtellingJaar = belastingSchijf1 + belastingSchijf2;
    } else {
      // Gemengde berekening over alle schijven
      const schijf1Deel = Math.max(0, SCHIJF1_GRENS - jaarsalarisBerekend);
      const schijf2Deel = Math.max(0, SCHIJF2_GRENS - jaarsalarisBerekend - schijf1Deel);
      const schijf3Deel = brutoBijtelling - schijf1Deel - schijf2Deel;
      
      const belastingSchijf1 = schijf1Deel * (SCHIJF1_TARIEF / 100);
      const belastingSchijf2 = schijf2Deel * (SCHIJF2_TARIEF / 100);
      const belastingSchijf3 = schijf3Deel * (SCHIJF3_TARIEF / 100);
      
      nettoBijtellingJaar = belastingSchijf1 + belastingSchijf2 + belastingSchijf3;
    }

    setResults({
      bijtellingTarief: bijtellingsPercentage,
      brutoBijtellingJaar: Math.round(brutoBijtelling),
      brutoBijtellingMaand: Math.round(brutoBijtelling / 12),
      nettoBijtellingMaand: Math.round(nettoBijtellingJaar / 12),
    });

    setStep(4); // Ga naar resultaten
  };

  const SalaryCalculator = () => (
    <Modal
      visible={showSalaryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSalaryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Salaris Rekenhulp</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bruto maandsalaris (€)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.brutoMaandSalaris}
              onChangeText={(value) => handleInputChange('brutoMaandSalaris', value)}
              keyboardType="numeric"
              placeholder="Bijv. 3.500"
            />
          </View>

          <TouchableOpacity
            style={[styles.checkbox, formData.vakantiegeld && styles.checkboxSelected]}
            onPress={() => handleInputChange('vakantiegeld', !formData.vakantiegeld)}
          >
            <Text style={styles.checkboxText}>Vakantiegeld inbegrepen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkbox, formData.dertiendeMaand && styles.checkboxSelected]}
            onPress={() => handleInputChange('dertiendeMaand', !formData.dertiendeMaand)}
          >
            <Text style={styles.checkboxText}>13e maand inbegrepen</Text>
          </TouchableOpacity>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowSalaryModal(false)}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Sluiten
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    stepIndicator: {
      flexDirection: 'row',
      marginBottom: 30,
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
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    question: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
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
    optionText: {
      fontSize: 16,
      color: colors.text,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
    },
    dropdownContainer: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 12,
    },
    dropdownOption: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    resultLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    resultValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    calculatorButton: {
      backgroundColor: colors.secondary,
      padding: 8,
      borderRadius: 6,
      marginLeft: 8,
    },
    calculatorButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checkboxSelected: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    checkboxText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
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
    cancelButtonText: {
      color: colors.text,
    },
    comingSoon: {
      backgroundColor: colors.warning,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 12,
      alignSelf: 'flex-start',
    },
    comingSoonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bijtelling Check</Text>
            <Text style={styles.question}>
              Rijdt u meer dan 500 kilometer privé per jaar in uw zakelijke auto?
            </Text>
            
            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => setStep(2)}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Ja, meer dan 500 km</Text>
                <Text style={[styles.optionText, { color: colors.primary }]}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => {
                Alert.alert(
                  'Geen bijtelling',
                  'Bij 500 kilometer of minder privé per jaar hoeft u geen bijtelling te betalen.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Nee, 500 km of minder</Text>
                <Text style={[styles.optionText, { color: colors.primary }]}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voertuig Informatie</Text>
            <Text style={styles.question}>
              Hoe wilt u de voertuiginformatie invoeren?
            </Text>
            
            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => {
                Alert.alert(
                  'Binnenkort beschikbaar',
                  'Kenteken zoeken wordt binnenkort toegevoegd.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Kenteken opzoeken</Text>
                <View style={styles.comingSoon}>
                  <Text style={styles.comingSoonText}>Binnenkort</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => setStep(3)}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Handmatig invoeren</Text>
                <Text style={[styles.optionText, { color: colors.primary }]}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Voertuig Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cataloguswaarde (€)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.catalogusWaarde}
                  onChangeText={(value) => handleInputChange('catalogusWaarde', value)}
                  keyboardType="numeric"
                  placeholder="Bijv. 45.000"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bouwjaar</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.bouwjaar}
                  onChangeText={(value) => handleInputChange('bouwjaar', value)}
                  keyboardType="numeric"
                  placeholder="Bijv. 2023"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Aandrijving</Text>
                {aandrijvingOpties.map((optie) => (
                  <TouchableOpacity
                    key={optie.key}
                    style={[
                      styles.dropdownContainer,
                      formData.aandrijving === optie.key && { borderColor: colors.primary }
                    ]}
                    onPress={() => handleInputChange('aandrijving', optie.key)}
                  >
                    <View style={styles.dropdownOption}>
                      <Text style={styles.dropdownOptionText}>{optie.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Jaarsalaris (€)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={formData.jaarsalaris}
                    onChangeText={(value) => handleInputChange('jaarsalaris', value)}
                    keyboardType="numeric"
                    placeholder="Bijv. 42.000"
                  />
                  <TouchableOpacity
                    style={styles.calculatorButton}
                    onPress={() => setShowSalaryModal(true)}
                  >
                    <Text style={styles.calculatorButtonText}>🧮</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  Of gebruik de rekenhulp voor maandsalaris
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={calculateBijtelling}
              >
                <Text style={styles.buttonText}>Bereken Bijtelling</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case 4:
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Berekening Resultaten</Text>
              
              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bijtellingtarief:</Text>
                  <Text style={styles.resultValue}>{results.bijtellingTarief}%</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bruto bijtelling per jaar:</Text>
                  <Text style={styles.resultValue}>€{formatNumber(results.brutoBijtellingJaar)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bruto bijtelling per maand:</Text>
                  <Text style={styles.resultValue}>€{formatNumber(results.brutoBijtellingMaand)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Netto bijtelling per maand:</Text>
                  <Text style={[styles.resultValue, { color: colors.primary, fontSize: 18 }]}>
                    €{formatNumber(results.nettoBijtellingMaand)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={resetForm}
              >
                <Text style={styles.buttonText}>Nieuwe Berekening</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.stepDot,
                step >= stepNumber ? styles.stepDotActive : styles.stepDotInactive
              ]}
            />
          ))}
        </View>
        
        {renderStep()}
      </View>
      
      <SalaryCalculator />
    </SafeAreaView>
  );
};

export default BijtellingCheckScreen; 