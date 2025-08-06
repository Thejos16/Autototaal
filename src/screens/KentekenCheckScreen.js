import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const KentekenCheckScreen = () => {
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
        <Text style={styles.title}>Kentekencheck</Text>
        <Text style={styles.subtitle}>
          Controleer voertuiginformatie op basis van kenteken
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Voertuig Informatie</Text>
          <Text style={styles.cardDescription}>
            Voer een kenteken in om gedetailleerde informatie over het voertuig te krijgen, 
            inclusief merk, model, bouwjaar en technische specificaties.
          </Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Geschiedenis</Text>
          <Text style={styles.cardDescription}>
            Bekijk de volledige geschiedenis van het voertuig, inclusief eigenaars, 
            onderhoud en eventuele schade.
          </Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KentekenCheckScreen; 