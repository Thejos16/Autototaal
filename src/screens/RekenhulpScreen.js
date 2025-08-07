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
    },
    {
      id: 'bijtelling',
      title: 'Bijtelling Check',
      description: 'Bereken bijtelling voor zakelijke auto\'s',
      icon: '📊',
      screen: 'BijtellingCheck',
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
    },
    calculationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    calculationIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    calculationInfo: {
      flex: 1,
    },
    calculationTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    calculationDescription: {
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
          <Text style={styles.title}>Rekenhulp</Text>
          <Text style={styles.subtitle}>
            Bereken BPM en bijtelling voor je voertuig. 
            Krijg inzicht in de kosten en belastingen die 
            van toepassing zijn op jouw situatie.
          </Text>
        </View>

        {/* Calculations Section */}
        <View style={styles.calculationsSection}>
          <Text style={styles.sectionTitle}>Beschikbare Berekenings</Text>
          
          {calculationOptions.map((calculation) => (
            <TouchableOpacity
              key={calculation.id}
              style={styles.calculationCard}
              onPress={() => navigation.navigate(calculation.screen)}
            >
              <View style={styles.calculationHeader}>
                <Text style={styles.calculationIcon}>{calculation.icon}</Text>
                <View style={styles.calculationInfo}>
                  <Text style={styles.calculationTitle}>{calculation.title}</Text>
                  <Text style={styles.calculationDescription}>
                    {calculation.description}
                  </Text>
                </View>
              </View>
              <View style={styles.comingSoon}>
                <Text style={styles.comingSoonText}>Binnenkort beschikbaar</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RekenhulpScreen;
