import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const { colors, theme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

  const themeOptions = [
    { key: 'light', label: 'Licht', description: 'Altijd lichte achtergrond' },
    { key: 'dark', label: 'Donker', description: 'Altijd donkere achtergrond' },
    { key: 'system', label: 'Systeem', description: 'Volgt je apparaat instellingen' },
  ];

  const handlePushNotificationToggle = (value) => {
    if (value && !pushNotificationsEnabled) {
      // Als we notificaties willen inschakelen, open dan iOS instellingen
      Alert.alert(
        'Notificaties Inschakelen',
        'Om notificaties te ontvangen, moet je deze eerst inschakelen in je iPhone instellingen.',
        [
          {
            text: 'Annuleren',
            style: 'cancel',
          },
          {
            text: 'Instellingen Openen',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
    } else {
      setPushNotificationsEnabled(value);
    }
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
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    optionContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionInfo: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    currentThemeText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      maxWidth: 400,
      width: '100%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    themeOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedThemeOption: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    themeOptionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    themeOptionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.text,
    },
    confirmButtonText: {
      color: colors.background,
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voorkeuren</Text>
          
          {/* Theme Selection */}
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Thema</Text>
                <Text style={styles.optionDescription}>
                  Kies je voorkeur voor licht of donker thema
                </Text>
              </View>
              <Text style={styles.currentThemeText}>
                {themeOptions.find(option => option.key === theme)?.label}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Push Notifications */}
          <View style={styles.optionContainer}>
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Push Notificaties</Text>
                <Text style={styles.optionDescription}>
                  Ontvang meldingen over belangrijke updates
                </Text>
              </View>
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={handlePushNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={pushNotificationsEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity activeOpacity={1}>
              <Text style={styles.modalTitle}>Kies Thema</Text>
              
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.themeOption,
                    theme === option.key && styles.selectedThemeOption,
                  ]}
                  onPress={() => {
                    setTheme(option.key);
                    setShowThemeModal(false);
                  }}
                >
                  <Text style={styles.themeOptionText}>{option.label}</Text>
                  <Text style={styles.themeOptionDescription}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowThemeModal(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Annuleren
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen; 