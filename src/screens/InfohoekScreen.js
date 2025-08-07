import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const InfohoekScreen = () => {
  const { colors } = useTheme();

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
      marginBottom: 40,
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
    infoSection: {
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
    infoTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    infoText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Infohoek</Text>
          <Text style={styles.subtitle}>
            Hier vind je alle informatie over voertuigen, 
            belastingen en regelgeving. Blijf op de hoogte 
            van de laatste ontwikkelingen.
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Beschikbare Informatie</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚗 Voertuiginformatie</Text>
            <Text style={styles.infoText}>
              Leer alles over verschillende voertuigtypes, hun specificaties 
              en wat je moet weten bij aankoop of verkoop.
            </Text>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💰 Belastingen & Kosten</Text>
            <Text style={styles.infoText}>
              Uitgebreide informatie over BPM, bijtelling, wegenbelasting 
              en andere kosten die komen kijken bij autobezit.
            </Text>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Regelgeving</Text>
            <Text style={styles.infoText}>
              Actuele informatie over wetgeving, verplichtingen en 
              regelgeving rondom voertuigen en verkeer.
            </Text>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InfohoekScreen;
