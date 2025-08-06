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

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const checkOptions = [
    {
      id: 'kenteken',
      title: 'Kentekencheck',
      description: 'Controleer voertuiginformatie op basis van kenteken',
      icon: '🚗',
      screen: 'KentekenCheck',
    },
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
    welcomeSection: {
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
    checksSection: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    checkCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checkHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    checkIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    checkInfo: {
      flex: 1,
    },
    checkTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    checkDescription: {
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
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Welkom bij Autototaal!</Text>
          <Text style={styles.subtitle}>
            Ontdek alles over je voertuig met onze handige tools. 
            Controleer kentekens, bereken BPM en bijtelling, en krijg 
            inzicht in alle belangrijke voertuig informatie.
          </Text>
        </View>

        {/* Checks Section */}
        <View style={styles.checksSection}>
          <Text style={styles.sectionTitle}>Beschikbare Tools</Text>
          
          {checkOptions.map((check) => (
            <TouchableOpacity
              key={check.id}
              style={styles.checkCard}
              onPress={() => navigation.navigate(check.screen)}
            >
              <View style={styles.checkHeader}>
                <Text style={styles.checkIcon}>{check.icon}</Text>
                <View style={styles.checkInfo}>
                  <Text style={styles.checkTitle}>{check.title}</Text>
                  <Text style={styles.checkDescription}>
                    {check.description}
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

export default HomeScreen; 