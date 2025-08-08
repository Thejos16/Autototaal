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
  });

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

  const handleKentekenChange = (text) => {
    const formatted = formatKenteken(text);
    setKenteken(formatted);
  };

  const searchVehicle = async () => {
    if (!kenteken || kenteken.length < 6) {
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
            placeholder="XX-XX-XX"
            placeholderTextColor={colors.textSecondary}
            maxLength={8}
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
            
            {/* Algemene Informatie */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Algemene Informatie</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Merk:</Text>
                <Text style={styles.infoValue}>{vehicleData.merk || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model:</Text>
                <Text style={styles.infoValue}>{vehicleData.handelsbenaming || 'Niet beschikbaar'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Catalogusprijs:</Text>
                <Text style={styles.infoValue}>{formatPrice(vehicleData.catalogusprijs)}</Text>
              </View>
            </View>

            {/* Motorgegevens */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Motorgegevens</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vermogen/massa rijklaar:</Text>
                <Text style={styles.infoValue}>{formatPower(vehicleData.vermogen_massarijklaar)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cilinderinhoud:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.cilinderinhoud ? `${vehicleData.cilinderinhoud} cc` : 'Niet beschikbaar'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aantal cilinders:</Text>
                <Text style={styles.infoValue}>
                  {vehicleData.aantal_cilinders || 'Niet beschikbaar'}
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