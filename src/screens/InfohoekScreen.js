import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    arrowIcon: {
      fontSize: 20,
      color: colors.textSecondary,
      marginLeft: 12,
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
          
          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>🚗 Voertuiginformatie</Text>
              <Text style={styles.infoText}>
                Leer alles over verschillende voertuigtypes en specificaties
              </Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>💰 Belastingen & Kosten</Text>
              <Text style={styles.infoText}>
                Uitgebreide informatie over BPM, bijtelling en wegenbelasting
              </Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>📋 Regelgeving</Text>
              <Text style={styles.infoText}>
                Actuele informatie over wetgeving en verplichtingen
              </Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InfohoekScreen;
