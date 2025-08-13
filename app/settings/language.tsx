// settings/language.tsx
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../hooks/useTranslation';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageScreenProps {
  theme?: any;
  navigation?: any;
}

export default function LanguageScreen({ theme, navigation }: LanguageScreenProps) {
  const { t, currentLanguage, changeLanguage, availableLanguages } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageChange = async (language: Language) => {
    if (language.code === currentLanguage) return;

    setIsChanging(true);
    setSelectedLanguage(language.code);

    try {
      await changeLanguage(language.code);
      
      // Show success message
      Alert.alert(
        t('common.success'),
        t('settings.languageChanged'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        t('errors.generic'),
        [{ text: t('common.ok') }]
      );
      setSelectedLanguage(currentLanguage);
    } finally {
      setIsChanging(false);
    }
  };

  const renderLanguageItem = (language: Language) => {
    const isSelected = language.code === currentLanguage;
    const isChangingToThis = isChanging && selectedLanguage === language.code;

    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageItem,
          {
            backgroundColor: isSelected 
              ? theme?.ui?.primary + '15' || '#0d6efd15'
              : theme?.ui?.bg || '#ffffff',
            borderColor: isSelected 
              ? theme?.ui?.primary || '#0d6efd'
              : theme?.ui?.border || '#dee2e6',
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handleLanguageChange(language)}
        disabled={isChanging}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <View style={styles.languageInfo}>
            <Text style={[
              styles.nativeName,
              {
                color: theme?.ui?.text || '#212529',
                fontWeight: isSelected ? '600' : '500'
              }
            ]}>
              {language.nativeName}
            </Text>
            <Text style={[
              styles.englishName,
              { color: theme?.ui?.textMuted || '#6c757d' }
            ]}>
              {language.name}
            </Text>
          </View>

          <View style={styles.selectionIndicator}>
            {isChangingToThis ? (
              <ActivityIndicator 
                size="small" 
                color={theme?.ui?.primary || '#0d6efd'} 
              />
            ) : isSelected ? (
              <View style={[
                styles.checkmark,
                { backgroundColor: theme?.ui?.primary || '#0d6efd' }
              ]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            ) : (
              <View style={[
                styles.radioButton,
                { borderColor: theme?.ui?.border || '#dee2e6' }
              ]} />
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.currentLabel}>
            <Text style={[
              styles.currentLabelText,
              { color: theme?.ui?.primary || '#0d6efd' }
            ]}>
              {t('settings.currentLanguage')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: theme?.ui?.bg || '#ffffff' }
    ]}>
      {/* Header */}
      <View style={[
        styles.header,
        { borderBottomColor: theme?.ui?.border || '#dee2e6' }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={[
            styles.backButtonText,
            { color: theme?.ui?.primary || '#0d6efd' }
          ]}>
            ← {t('common.back')}
          </Text>
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { color: theme?.ui?.text || '#212529' }
        ]}>
          {t('settings.languageSettings')}
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[
            styles.description,
            { color: theme?.ui?.textMuted || '#6c757d' }
          ]}>
            {t('settings.selectLanguage')}
          </Text>
        </View>

        {/* Language List */}
        <View style={styles.languageList}>
          {availableLanguages.map(renderLanguageItem)}
        </View>

        {/* Device Language Info */}
        <View style={[
          styles.infoContainer,
          { backgroundColor: theme?.ui?.infoBg || '#e7f3ff' }
        ]}>
          <Text style={[
            styles.infoTitle,
            { color: theme?.ui?.text || '#212529' }
          ]}>
            💡 {t('common.info')}
          </Text>
          <Text style={[
            styles.infoText,
            { color: theme?.ui?.textMuted || '#6c757d' }
          ]}>
            The app will automatically detect your device language when you first install it. 
            You can change it anytime here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  descriptionContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  languageList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  languageItem: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 4,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInfo: {
    flex: 1,
  },
  nativeName: {
    fontSize: 18,
    marginBottom: 4,
  },
  englishName: {
    fontSize: 14,
  },
  selectionIndicator: {
    marginLeft: 16,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  currentLabel: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  currentLabelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});