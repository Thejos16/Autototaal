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
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const VoordeligsteRijdenScreen = () => {
  const { colors } = useTheme();
  const [kilometersPerYear, setKilometersPerYear] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  
  // Auto 1 state
  const [aandrijving1, setAandrijving1] = useState('Benzine');
  const [verbruik1, setVerbruik1] = useState('');
  const [prijs1, setPrijs1] = useState('');
  
  // Auto 2 state
  const [aandrijving2, setAandrijving2] = useState('Benzine');
  const [verbruik2, setVerbruik2] = useState('');
  const [prijs2, setPrijs2] = useState('');

  const aandrijvingOpties = ['Benzine', 'Diesel', 'Elektrisch'];

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
  });

  const getVerbruikLabel = (aandrijving) => {
    return aandrijving === 'Elektrisch' ? 'kWh per 100 km' : 'Liter per 100 km';
  };

  const getPrijsLabel = (aandrijving) => {
    if (aandrijving === 'Elektrisch') {
      return 'Prijs per kWh (€)';
    } else if (aandrijving === 'Diesel') {
      return 'Diesel prijs per liter (€)';
    } else {
      return 'Benzine prijs per liter (€)';
    }
  };

  const getPrijsPlaceholder = (aandrijving) => {
    if (aandrijving === 'Elektrisch') {
      return '0.25';
    } else if (aandrijving === 'Diesel') {
      return '1.45';
    } else {
      return '1.65';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
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

            {/* Prijs Input */}
            <Text style={styles.inputLabel}>{getPrijsLabel(aandrijving1)}</Text>
            <TextInput
              style={styles.input}
              value={prijs1}
              onChangeText={setPrijs1}
              placeholder={getPrijsPlaceholder(aandrijving1)}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Auto 2 */}
        <View style={styles.autoSection}>
          <Text style={styles.autoTitle}>Auto 2</Text>
          <View style={styles.autoCard}>
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

            {/* Prijs Input */}
            <Text style={styles.inputLabel}>{getPrijsLabel(aandrijving2)}</Text>
            <TextInput
              style={styles.input}
              value={prijs2}
              onChangeText={setPrijs2}
              placeholder={getPrijsPlaceholder(aandrijving2)}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

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
