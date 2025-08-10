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

const RekenhulpScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const calculationOptions = [
    {
      id: 'bpm',
      title: 'BPM Check',
      description: 'Bereken en controleer BPM voor je voertuig',
      icon: '💰',
      screen: 'BpmCheck',
      comingSoon: false,
    },
    {
      id: 'bijtelling',
      title: 'Bijtelling Check',
      description: 'Bereken bijtelling voor zakelijke auto\'s',
      icon: '📊',
      screen: 'BijtellingCheck',
      comingSoon: false,
    },
    {
      id: 'voordeligste',
      title: 'Voordeligste Rijden',
      description: 'Bepaal wat het goedkoopste voor je is: benzine, diesel of elektrisch',
      icon: '⛽',
      screen: 'VoordeligsteRijden',
      comingSoon: true,
    },
    {
      id: 'verzekering',
      title: 'Verzekeringscheck',
      description: 'Bereken je verwachte verzekering',
      icon: '🛡️',
      screen: 'Verzekeringscheck',
      comingSoon: true,
    },
  ];

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
    calculationsSection: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    calculationCard: {
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
    calculationContent: {
      flex: 1,
    },
    calculationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    calculationIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    calculationInfo: {
      flex: 1,
    },
    calculationTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    calculationDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    arrowIcon: {
      fontSize: 20,
      color: colors.textSecondary,
      marginLeft: 12,
    },
    comingSoon: {
      backgroundColor: colors.warning,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
      alignSelf: 'flex-start',
    },
    comingSoonText: {
      color: colors.background,
      fontSize: 10,
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
        {/* Welcome Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Rekenhulp</Text>
          <Text style={styles.subtitle}>
            Bereken alle kosten en belastingen voor je voertuig. 
            Van BPM en bijtelling tot brandstofkosten en verzekering.
          </Text>
        </View>

        {/* Calculations Section */}
        <View style={styles.calculationsSection}>
          <Text style={styles.sectionTitle}>Beschikbare Berekenings</Text>
          
          {calculationOptions.map((calculation) => (
            <TouchableOpacity
              key={calculation.id}
              style={styles.calculationCard}
              onPress={() => {
                if (!calculation.comingSoon) {
                  navigation.navigate(calculation.screen);
                }
              }}
            >
              <View style={styles.calculationContent}>
                <View style={styles.calculationHeader}>
                  <Text style={styles.calculationIcon}>{calculation.icon}</Text>
                  <View style={styles.calculationInfo}>
                    <Text style={styles.calculationTitle}>{calculation.title}</Text>
                    <Text style={styles.calculationDescription}>
                      {calculation.description}
                    </Text>
                  </View>
                </View>
                {calculation.comingSoon && (
                  <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
                  </View>
                )}
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RekenhulpScreen;
