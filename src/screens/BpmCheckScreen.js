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
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const BpmCheckScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [showCo2InfoModal, setShowCo2InfoModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  
  // Get today's date in DD-MM-YYYY format
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // Form data
  const [formData, setFormData] = useState({
    autoType: '', // 'nieuw' of 'gebruikt'
    voertuigType: '', // 'personenauto', 'motor', 'bestelauto'
    datumEersteToelating: '',
    datumAangifte: getTodayDate(),
    catalogusPrijs: '',
    isBrutoPrijs: true, // true = bruto, false = netto
    brandstof: '', // 'benzine', 'diesel', 'elektrisch', 'hybride'
    co2Uitstoot: '',
    datumGoedkeuringRDW: '',
    consumentenPrijs: '',
    inkoopwaardeKoerslijst: '',
    afschrijvingsMethode: '', // 'forfaitair', 'koerslijst', 'taxatierapport'
  });

  // Calculation results
  const [results, setResults] = useState({
    bpmBasis: 0,
    uitstootToeslag: 0, // brandstoftoeslag + CO2 uitstoot
    brandstoftoeslag: 0,
    co2Toeslag: 0,
    afschrijvingsPercentage: 0,
    afschrijvingsKorting: 0,
    nettoBpm: 0,
    calculationDetails: '',
  });

  const voertuigTypes = [
    { key: 'personenauto', label: 'Personenauto' },
    { key: 'motor', label: 'Motor' },
    { key: 'bestelauto', label: 'Bestelauto' },
  ];

  const brandstoffen = [
    { key: 'benzine', label: 'Benzine' },
    { key: 'diesel', label: 'Diesel' },
    { key: 'elektrisch', label: 'Elektrisch' },
    { key: 'hybride', label: 'Hybride' },
  ];

  const afschrijvingsMethodes = [
    { key: 'forfaitair', label: 'Forfaitaire tabel' },
    { key: 'koerslijst', label: 'Koerslijst' },
    { key: 'taxatierapport', label: 'Taxatierapport' },
  ];

  // Helper function to format numbers with thousands separators
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Helper function to parse Dutch date format (DD-MM-YYYY) to Date object
  const parseDutchDate = (dateString) => {
    if (!dateString || dateString.length !== 10) return null;
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
  };

  // Helper function to calculate months between dates
  const calculateMonthsBetween = (date1, date2) => {
    const d1 = parseDutchDate(date1);
    const d2 = parseDutchDate(date2);
    
    if (!d1 || !d2) {
      console.log('Invalid date format:', date1, date2);
      return 0;
    }
    
    const yearDiff = d2.getFullYear() - d1.getFullYear();
    const monthDiff = d2.getMonth() - d1.getMonth();
    const dayDiff = d2.getDate() - d1.getDate();
    
    let months = yearDiff * 12 + monthDiff;
    
    // Adjust for day difference - if the day is later in the month, count as full month
    if (dayDiff > 0) {
      months += 1;
    }
    
    console.log(`Date 1: ${date1} -> ${d1.toISOString()}`);
    console.log(`Date 2: ${date2} -> ${d2.toISOString()}`);
    console.log(`Calculated months: ${months}`);
    
    return Math.max(0, months);
  };

  // Helper function to calculate depreciation percentage using forfaitaire tabel
  const calculateForfaitaireAfschrijving = (datumEersteToelating, datumGoedkeuring) => {
    const months = calculateMonthsBetween(datumEersteToelating, datumGoedkeuring);
    
    console.log(`Months between dates: ${months}`);
    
    // Forfaitaire tabel volgens officiële regels
    if (months <= 1) {
      return 0;
    } else if (months <= 3) {
      // 0-1 maand: 0%, 1-3 maanden: 12% + 4% per extra maand
      const extraMonths = months - 1;
      return 12 + (extraMonths * 4);
    } else if (months <= 5) {
      // 3-5 maanden: 20% + 3,5% per extra maand
      const extraMonths = months - 3;
      return 20 + (extraMonths * 3.5);
    } else if (months <= 9) {
      // 5-9 maanden: 27% + 1,5% per extra maand
      const extraMonths = months - 5;
      return 27 + (extraMonths * 1.5);
    } else if (months <= 18) {
      // 9-18 maanden: 33% + 1% per extra maand
      const extraMonths = months - 9;
      return 33 + (extraMonths * 1);
    } else if (months <= 30) {
      // 18-30 maanden: 42% + 0,75% per extra maand
      const extraMonths = months - 18;
      return 42 + (extraMonths * 0.75);
    } else if (months <= 42) {
      // 30-42 maanden: 51% + 0,5% per extra maand
      const extraMonths = months - 30;
      return 51 + (extraMonths * 0.5);
    } else if (months <= 54) {
      // 42-54 maanden: 57% + 0,42% per extra maand
      const extraMonths = months - 42;
      return 57 + (extraMonths * 0.42);
    } else if (months <= 66) {
      // 54-66 maanden: 62% + 0,42% per extra maand
      const extraMonths = months - 54;
      return 62 + (extraMonths * 0.42);
    } else if (months <= 78) {
      // 66-78 maanden: 67% + 0,42% per extra maand
      const extraMonths = months - 66;
      return 67 + (extraMonths * 0.42);
    } else if (months <= 90) {
      // 78-90 maanden: 72% + 0,25% per extra maand
      const extraMonths = months - 78;
      return 72 + (extraMonths * 0.25);
    } else if (months <= 102) {
      // 90-102 maanden: 75% + 0,25% per extra maand
      const extraMonths = months - 90;
      return 75 + (extraMonths * 0.25);
    } else if (months <= 114) {
      // 102-114 maanden: 78% + 0,25% per extra maand
      const extraMonths = months - 102;
      return 78 + (extraMonths * 0.25);
    } else {
      // 114+ maanden: 81% + 0,19% per extra maand
      const extraMonths = months - 114;
      return 81 + (extraMonths * 0.19);
    }
  };

  // Helper function to convert bruto to netto catalogusprijs
  const convertBrutoToNetto = (brutoPrijs) => {
    // Based on Autoweek calculation example
    // Bruto = Netto + BTW + BPM basis + BPM brandstoftoeslag + BPM CO2 toeslag
    // For simplicity, we'll use a rough estimation
    // Netto ≈ Bruto / 1.4 (approximate factor)
    return Math.round(brutoPrijs / 1.4);
  };

  const resetForm = () => {
    setFormData({
      autoType: '',
      voertuigType: '',
      datumEersteToelating: '',
      datumAangifte: getTodayDate(),
      catalogusPrijs: '',
      isBrutoPrijs: true,
      brandstof: '',
      co2Uitstoot: '',
      datumGoedkeuringRDW: '',
      consumentenPrijs: '',
      inkoopwaardeKoerslijst: '',
      afschrijvingsMethode: '',
    });
    setResults({
      bpmBasis: 0,
      uitstootToeslag: 0,
      brandstoftoeslag: 0,
      co2Toeslag: 0,
      afschrijvingsPercentage: 0,
      afschrijvingsKorting: 0,
      nettoBpm: 0,
      calculationDetails: '',
    });
    setStep(1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBpm = () => {
    const {
      voertuigType,
      brandstof,
      co2Uitstoot,
      datumEersteToelating,
      catalogusPrijs,
      isBrutoPrijs,
      datumGoedkeuringRDW,
      consumentenPrijs,
      inkoopwaardeKoerslijst,
      afschrijvingsMethode,
    } = formData;

    if (!voertuigType || !brandstof || !co2Uitstoot || !datumEersteToelating || !catalogusPrijs) {
      Alert.alert('Fout', 'Vul alle verplichte velden in om de BPM te berekenen.');
      return;
    }

    if (formData.autoType === 'gebruikt' && !datumGoedkeuringRDW) {
      Alert.alert('Fout', 'Vul de datum goedkeuring RDW in voor gebruikte auto\'s.');
      return;
    }

    const co2 = parseFloat(co2Uitstoot);
    const datumEerste = datumEersteToelating;
    const datumGoedkeuring = datumGoedkeuringRDW;

    // Convert catalogusprijs to netto if needed
    let nettoCatalogusPrijs = parseFloat(catalogusPrijs);
    if (isBrutoPrijs) {
      nettoCatalogusPrijs = convertBrutoToNetto(nettoCatalogusPrijs);
    }

    // BPM basis berekenen (19% van netto catalogusprijs)
    const bpmBasis = nettoCatalogusPrijs * 0.19;

    // BPM tarieven 2025 voor personenauto's (CO2 uitstoot toeslag)
    let co2Toeslag = 0;
    let co2Calculation = '';
    
    if (co2 <= 79) {
      co2Toeslag = 667 + (co2 * 2);
      co2Calculation = `€667 + (${co2} × €2) = €${formatNumber(co2Toeslag)}`;
    } else if (co2 <= 101) {
      const extra = co2 - 79;
      co2Toeslag = 825 + (extra * 79);
      co2Calculation = `€825 + (${extra} × €79) = €${formatNumber(co2Toeslag)}`;
    } else if (co2 <= 141) {
      const extra = co2 - 101;
      co2Toeslag = 2563 + (extra * 173);
      co2Calculation = `€2.563 + (${extra} × €173) = €${formatNumber(co2Toeslag)}`;
    } else if (co2 <= 157) {
      const extra = co2 - 141;
      co2Toeslag = 9483 + (extra * 284);
      co2Calculation = `€9.483 + (${extra} × €284) = €${formatNumber(co2Toeslag)}`;
    } else {
      const extra = co2 - 157;
      co2Toeslag = 14027 + (extra * 568);
      co2Calculation = `€14.027 + (${extra} × €568) = €${formatNumber(co2Toeslag)}`;
    }

    // Brandstoftoeslag berekenen
    let brandstoftoeslag = 0;
    let brandstofCalculation = '';
    if (brandstof === 'diesel' && co2 > 70) {
      const extra = co2 - 70;
      brandstoftoeslag = extra * 109.87;
      brandstofCalculation = `(${co2} - 70) × €109,87 = ${extra} × €109,87 = €${formatNumber(brandstoftoeslag)}`;
    }

    // Uitstoot toeslag (brandstoftoeslag + CO2 uitstoot)
    const uitstootToeslag = brandstoftoeslag + co2Toeslag;

    // Afschrijvingskorting berekenen
    let afschrijvingsPercentage = 0;
    let afschrijvingsKorting = 0;
    let afschrijvingCalculation = '';

    if (formData.autoType === 'gebruikt') {
      if (afschrijvingsMethode === 'forfaitair') {
        afschrijvingsPercentage = calculateForfaitaireAfschrijving(datumEerste, datumGoedkeuring);
        afschrijvingCalculation = `Forfaitaire tabel: ${afschrijvingsPercentage.toFixed(2)}%`;
      } else if (afschrijvingsMethode === 'koerslijst') {
        if (consumentenPrijs && inkoopwaardeKoerslijst) {
          const afschrijving = parseFloat(consumentenPrijs) - parseFloat(inkoopwaardeKoerslijst);
          afschrijvingsPercentage = (afschrijving / parseFloat(consumentenPrijs)) * 100;
          afschrijvingCalculation = `Koerslijst: (€${formatNumber(consumentenPrijs)} - €${formatNumber(inkoopwaardeKoerslijst)}) / €${formatNumber(consumentenPrijs)} × 100 = ${afschrijvingsPercentage.toFixed(2)}%`;
        }
      }
      
      afschrijvingsKorting = (afschrijvingsPercentage / 100) * (bpmBasis + uitstootToeslag);
    }

    const nettoBpm = bpmBasis + uitstootToeslag - afschrijvingsKorting;

    // Build calculation details
    const calculationDetails = `
BPM Berekening Details:

1. Netto catalogusprijs: €${formatNumber(nettoCatalogusPrijs)}
   ${isBrutoPrijs ? '(omgerekend van bruto prijs)' : ''}

2. BPM basis (19%): €${formatNumber(nettoCatalogusPrijs)} × 0,19 = €${formatNumber(bpmBasis)}

3. CO2 uitstoot toeslag (${co2} gr/km):
   ${co2Calculation}

4. Brandstoftoeslag:
   ${brandstofCalculation || 'Geen brandstoftoeslag (geen diesel)'}

5. Totale uitstoot toeslag: €${formatNumber(brandstoftoeslag)} + €${formatNumber(co2Toeslag)} = €${formatNumber(uitstootToeslag)}

${formData.autoType === 'gebruikt' ? `
6. Afschrijvingskorting (${afschrijvingsMethode}):
   ${afschrijvingCalculation}
   ${afschrijvingsMethode === 'forfaitair' ? `
   Periode: ${datumEersteToelating} tot ${datumGoedkeuringRDW}
   Aantal maanden: ${calculateMonthsBetween(datumEerste, datumGoedkeuring)}
   ` : ''}
   Korting: ${afschrijvingsPercentage.toFixed(2)}% × €${formatNumber(bpmBasis + uitstootToeslag)} = €${formatNumber(afschrijvingsKorting)}
` : ''}

7. Netto BPM: €${formatNumber(bpmBasis)} + €${formatNumber(uitstootToeslag)} - €${formatNumber(afschrijvingsKorting)} = €${formatNumber(nettoBpm)}
`;

    setResults({
      bpmBasis: Math.round(bpmBasis),
      uitstootToeslag: Math.round(uitstootToeslag),
      brandstoftoeslag: Math.round(brandstoftoeslag),
      co2Toeslag: Math.round(co2Toeslag),
      afschrijvingsPercentage: Math.round(afschrijvingsPercentage * 100) / 100,
      afschrijvingsKorting: Math.round(afschrijvingsKorting),
      nettoBpm: Math.round(nettoBpm),
      calculationDetails: calculationDetails,
    });

    setStep(4);
  };

  const CalculationModal = () => (
    <Modal
      visible={showCalculationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCalculationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Berekening Details</Text>
          
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={styles.calculationText}>
              {results.calculationDetails}
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowCalculationModal(false)}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Sluiten
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const Co2InfoModal = () => (
    <Modal
      visible={showCo2InfoModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCo2InfoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>CO2-uitstoot Informatie</Text>
          
          <Text style={styles.modalText}>
            <Text style={{ fontWeight: 'bold' }}>Welke CO2-waarde gebruiken?</Text>{'\n\n'}
            
            <Text style={{ fontWeight: 'bold' }}>Toelatingsdatum na 1 juli 2020:</Text>{'\n'}
            • Altijd de WLTP-waarde gebruiken{'\n\n'}
            
            <Text style={{ fontWeight: 'bold' }}>Toelatingsdatum voor 1 juli 2020:</Text>{'\n'}
            • Altijd de NEDC-waarde gebruiken{'\n\n'}
            
            <Text style={{ fontWeight: 'bold' }}>Toelatingsdatum tussen 1 september 2018 en 1 juli 2020:</Text>{'\n'}
            • Indien beide bekend: 2 berekeningen maken{'\n'}
            • Kies de gunstigste uitkomst
          </Text>

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowCo2InfoModal(false)}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Sluiten
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const DepreciationModal = () => (
    <Modal
      visible={showDepreciationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDepreciationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Afschrijvingskorting</Text>
          
          <Text style={styles.modalText}>
            Voor gebruikte auto's kunt u kiezen uit 3 methodes om de afschrijvingskorting te berekenen:
          </Text>

          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>1. Forfaitaire tabel</Text>
            <Text style={styles.methodDescription}>
              Automatische berekening op basis van datum eerste toelating en datum goedkeuring RDW.
            </Text>
          </View>

          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>2. Koerslijst</Text>
            <Text style={styles.methodDescription}>
              Berekening op basis van consumentenprijs en inkoopwaarde volgens koerslijst.
            </Text>
          </View>

          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>3. Taxatierapport</Text>
            <Text style={styles.methodDescription}>
              Voor auto's met meer dan normale gebruiksschade of niet in koerslijst.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowDepreciationModal(false)}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Sluiten
            </Text>
          </TouchableOpacity>
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
    warningBox: {
      backgroundColor: colors.warning + '20',
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
      padding: 16,
      marginBottom: 20,
      borderRadius: 8,
    },
    warningText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
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
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleLabel: {
      fontSize: 16,
      color: colors.text,
    },
    toggleValue: {
      fontSize: 14,
      color: colors.textSecondary,
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
    infoButton: {
      backgroundColor: colors.secondary,
      padding: 8,
      borderRadius: 6,
      marginLeft: 8,
    },
    infoButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
    infoBox: {
      backgroundColor: colors.info + '20',
      borderLeftWidth: 4,
      borderLeftColor: colors.info,
      padding: 12,
      marginBottom: 16,
      borderRadius: 8,
    },
    infoText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 16,
    },
    calculationButton: {
      backgroundColor: colors.secondary,
      padding: 8,
      borderRadius: 6,
      marginLeft: 8,
    },
    calculationButtonText: {
      color: colors.background,
      fontSize: 12,
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
    modalText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 20,
      lineHeight: 20,
    },
    calculationText: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 18,
      fontFamily: 'monospace',
    },
    methodCard: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    methodDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    modalButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
    },
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BPM Check</Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                <Text style={{ fontWeight: 'bold' }}>Let op!</Text>{'\n'}
                Als particulier moet u ook btw-aangifte doen en btw betalen voor auto's die:{'\n'}
                • niet langer dan 6 maanden geleden in gebruik zijn genomen, of{'\n'}
                • niet meer dan 6.000 kilometer hebben gereden
              </Text>
            </View>

            <Text style={styles.question}>
              Wat voor type auto heeft u?
            </Text>
            
            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => {
                handleInputChange('autoType', 'nieuw');
                setStep(2);
              }}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Nieuwe auto</Text>
                <Text style={[styles.optionText, { color: colors.primary }]}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => {
                handleInputChange('autoType', 'gebruikt');
                setStep(2);
              }}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Gebruikte auto</Text>
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
              Wat voor type voertuig is het?
            </Text>
            
            {voertuigTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.optionContainer,
                  formData.voertuigType === type.key && { borderColor: colors.primary }
                ]}
                onPress={() => {
                  handleInputChange('voertuigType', type.key);
                  setStep(3);
                }}
              >
                <View style={styles.optionRow}>
                  <Text style={styles.optionText}>{type.label}</Text>
                  <Text style={[styles.optionText, { color: colors.primary }]}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Voertuig Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Datum eerste toelating</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.datumEersteToelating}
                  onChangeText={(value) => handleInputChange('datumEersteToelating', value)}
                  placeholder="DD-MM-YYYY"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Datum aangifte</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.datumAangifte}
                  onChangeText={(value) => handleInputChange('datumAangifte', value)}
                  placeholder="DD-MM-YYYY"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catalogusprijs</Text>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>
                    {formData.isBrutoPrijs ? 'Bruto prijs' : 'Netto prijs'}
                  </Text>
                  <Switch
                    value={formData.isBrutoPrijs}
                    onValueChange={(value) => handleInputChange('isBrutoPrijs', value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={formData.catalogusPrijs}
                  onChangeText={(value) => handleInputChange('catalogusPrijs', value)}
                  keyboardType="numeric"
                  placeholder={formData.isBrutoPrijs ? "Bijv. 40.000" : "Bijv. 28.699"}
                />
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  {formData.isBrutoPrijs ? 'Inclusief BTW en BPM' : 'Exclusief BTW en BPM'}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Brandstof</Text>
                {brandstoffen.map((brandstof) => (
                  <TouchableOpacity
                    key={brandstof.key}
                    style={[
                      styles.dropdownContainer,
                      formData.brandstof === brandstof.key && { borderColor: colors.primary }
                    ]}
                    onPress={() => handleInputChange('brandstof', brandstof.key)}
                  >
                    <View style={styles.dropdownOption}>
                      <Text style={styles.dropdownOptionText}>{brandstof.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CO2-uitstoot (gr/km)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={formData.co2Uitstoot}
                    onChangeText={(value) => handleInputChange('co2Uitstoot', value)}
                    keyboardType="numeric"
                    placeholder="Bijv. 140"
                  />
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => setShowCo2InfoModal(true)}
                  >
                    <Text style={styles.infoButtonText}>ℹ️</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: 'bold' }}>CO2-waarde:</Text>{'\n'}
                    • Na 1 juli 2020: WLTP-waarde{'\n'}
                    • Voor 1 juli 2020: NEDC-waarde{'\n'}
                    • 2018-2020: beide indien bekend
                  </Text>
                </View>
              </View>

              {formData.autoType === 'gebruikt' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Datum goedkeuring RDW</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.datumGoedkeuringRDW}
                      onChangeText={(value) => handleInputChange('datumGoedkeuringRDW', value)}
                      placeholder="DD-MM-YYYY"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Afschrijvingsmethode</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        Kies de methode voor afschrijvingskorting
                      </Text>
                      <TouchableOpacity
                        style={styles.infoButton}
                        onPress={() => setShowDepreciationModal(true)}
                      >
                        <Text style={styles.infoButtonText}>ℹ️</Text>
                      </TouchableOpacity>
                    </View>
                    {afschrijvingsMethodes.map((methode) => (
                      <TouchableOpacity
                        key={methode.key}
                        style={[
                          styles.dropdownContainer,
                          formData.afschrijvingsMethode === methode.key && { borderColor: colors.primary }
                        ]}
                        onPress={() => handleInputChange('afschrijvingsMethode', methode.key)}
                      >
                        <View style={styles.dropdownOption}>
                          <Text style={styles.dropdownOptionText}>{methode.label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {formData.afschrijvingsMethode === 'koerslijst' && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Consumentenprijs (nieuwprijs in Nederland) (€)</Text>
                        <TextInput
                          style={styles.textInput}
                          value={formData.consumentenPrijs}
                          onChangeText={(value) => handleInputChange('consumentenPrijs', value)}
                          keyboardType="numeric"
                          placeholder="Bijv. 35.000"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Inkoopwaarde volgens koerslijst (€)</Text>
                        <TextInput
                          style={styles.textInput}
                          value={formData.inkoopwaardeKoerslijst}
                          onChangeText={(value) => handleInputChange('inkoopwaardeKoerslijst', value)}
                          keyboardType="numeric"
                          placeholder="Bijv. 20.000"
                        />
                      </View>
                    </>
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={calculateBpm}
              >
                <Text style={styles.buttonText}>Bereken BPM</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case 4:
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BPM Berekening Resultaten</Text>
              
              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>BPM basis:</Text>
                  <Text style={styles.resultValue}>€{formatNumber(results.bpmBasis)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Uitstoot toeslag:</Text>
                  <Text style={styles.resultValue}>€{formatNumber(results.uitstootToeslag)}</Text>
                </View>
                {formData.autoType === 'gebruikt' && results.afschrijvingsPercentage > 0 && (
                  <>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Afschrijvingspercentage:</Text>
                      <Text style={styles.resultValue}>{results.afschrijvingsPercentage}%</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Afschrijvingskorting:</Text>
                      <Text style={styles.resultValue}>€{formatNumber(results.afschrijvingsKorting)}</Text>
                    </View>
                  </>
                )}
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Netto BPM:</Text>
                  <Text style={[styles.resultValue, { color: colors.primary, fontSize: 18 }]}>
                    €{formatNumber(results.nettoBpm)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                  <TouchableOpacity
                    style={styles.calculationButton}
                    onPress={() => setShowCalculationModal(true)}
                  >
                    <Text style={styles.calculationButtonText}>📊 Berekening bekijken</Text>
                  </TouchableOpacity>
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
      
      <CalculationModal />
      <Co2InfoModal />
      <DepreciationModal />
    </SafeAreaView>
  );
};

export default BpmCheckScreen; 