import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const BpmCheckScreen = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      width: '100%',
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    cardDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    comingSoon: {
      backgroundColor: colors.warning,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 12,
    },
    comingSoonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BPM Check</Text>
        <Text style={styles.subtitle}>
          Bereken en controleer BPM (Belasting van Personenauto's en Motorrijwielen)
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BPM Berekenen</Text>
          <Text style={styles.cardDescription}>
            Bereken de BPM voor je voertuig op basis van CO2-uitstoot, 
            brandstofsoort en andere relevante factoren.
          </Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>BPM Vrijstelling</Text>
          <Text style={styles.cardDescription}>
            Controleer of je in aanmerking komt voor BPM-vrijstelling 
            of vermindering op basis van specifieke criteria.
          </Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historische BPM</Text>
          <Text style={styles.cardDescription}>
            Bekijk hoe BPM-tarieven zijn veranderd door de jaren heen 
            en wat dit betekent voor je voertuig.
          </Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BpmCheckScreen; 