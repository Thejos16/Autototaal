import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const VoordeligsteRijdenResultScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { resultaten } = route.params;

  const formatNumber = (number) => {
    return number.toLocaleString('nl-NL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getVerbruikLabel = (aandrijving) => {
    return aandrijving === 'Elektrisch' ? 'kWh per 100 km' : 'Liter per 100 km';
  };

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
    resultatenContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    resultatenTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    autoSection: {
      marginBottom: 20,
    },
    autoTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    resultatenRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
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
      marginVertical: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    vergelijkingSection: {
      backgroundColor: colors.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    vergelijkingTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    nieuweBerekeningKnop: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    nieuweBerekeningKnopText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

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
                stepNumber === 2 ? styles.stepDotActive : styles.stepDotInactive
              ]}
            />
          ))}
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Berekening Resultaten</Text>
          <Text style={styles.subtitle}>
            Vergelijking van jaarlijkse brandstofkosten
          </Text>
        </View>

        {/* Resultaten */}
        <View style={styles.resultatenContainer}>
          <Text style={styles.resultatenTitle}>Jaarlijkse Kosten</Text>
          
          {/* Dynamische Auto's */}
          {resultaten.autos.map((auto, index) => (
            <View key={auto.id}>
              <View style={styles.autoSection}>
                <Text style={[
                  styles.autoTitle,
                  auto.id === resultaten.voordeligsteId && { color: colors.primary }
                ]}>
                  {auto.naam} - {auto.aandrijving}
                  {auto.id === resultaten.voordeligsteId && ' ⭐'}
                </Text>
                <View style={styles.resultatenRow}>
                  <Text style={styles.resultatenLabel}>Verbruik:</Text>
                  <Text style={styles.resultatenValue}>
                    {auto.verbruik} {getVerbruikLabel(auto.aandrijving)}
                  </Text>
                </View>
                <View style={styles.resultatenRow}>
                  <Text style={styles.resultatenLabel}>Prijs:</Text>
                  <Text style={styles.resultatenValue}>
                    € {auto.prijs.toFixed(2)} per {auto.aandrijving === 'Elektrisch' ? 'kWh' : 'liter'}
                  </Text>
                </View>
                <View style={styles.resultatenRow}>
                  <Text style={styles.resultatenLabel}>Jaarlijkse brandstofkosten:</Text>
                  <Text style={[
                    styles.resultatenValue,
                    auto.id === resultaten.voordeligsteId && { color: colors.primary, fontWeight: 'bold' }
                  ]}>
                    € {formatNumber(auto.totaleKosten)}
                  </Text>
                </View>
              </View>
              {/* Divider behalve voor laatste auto */}
              {index < resultaten.autos.length - 1 && <View style={styles.resultatenDivider} />}
            </View>
          ))}

          {/* Vergelijking */}
          <View style={styles.vergelijkingSection}>
            <Text style={styles.vergelijkingTitle}>Vergelijking</Text>
            <View style={styles.resultatenRow}>
              <Text style={styles.resultatenLabel}>Voordeligste auto:</Text>
              <Text style={[styles.resultatenValue, { color: colors.primary }]}>
                {resultaten.voordeligste}
              </Text>
            </View>
            {resultaten.autos.length > 1 && (
              <View style={styles.resultatenRow}>
                <Text style={styles.resultatenLabel}>
                  {resultaten.autos.length === 2 ? 'Verschil in brandstofkosten per jaar:' : 'Max. verschil in brandstofkosten per jaar:'}
                </Text>
                <Text style={styles.resultatenValue}>
                  € {formatNumber(resultaten.verschil)}
                </Text>
              </View>
            )}
            <View style={styles.resultatenRow}>
              <Text style={styles.resultatenLabel}>Kilometers per jaar:</Text>
              <Text style={styles.resultatenValue}>
                {resultaten.kilometersPerYear.toLocaleString('nl-NL')} km
              </Text>
            </View>
            <View style={styles.resultatenRow}>
              <Text style={styles.resultatenLabel}>Aantal auto's vergeleken:</Text>
              <Text style={styles.resultatenValue}>
                {resultaten.autos.length}
              </Text>
            </View>

          </View>
        </View>

        {/* Nieuwe Berekening Knop */}
        <TouchableOpacity
          style={styles.nieuweBerekeningKnop}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.nieuweBerekeningKnopText}>
            Nieuwe Berekening
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VoordeligsteRijdenResultScreen;
