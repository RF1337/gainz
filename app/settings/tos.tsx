// app/terms.tsx
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useTheme } from '@/theme/ThemeProvider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TermsScreen() {
  const {ui} = useTheme();

  return (
<ScreenWrapper>
    <Header
      leftIcon={<BackButton />}
      title="Terms of Service"
    />
      {/* Terms of Service Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>1. Terms of Service</Text>
        <Text style={styles.paragraph}>
          Welcome to our app. By accessing or using this app, you agree to be bound by
          these Terms of Service (“Terms”). If you do not agree with any part of these
          Terms, you must not use the app.
        </Text>
        <Text style={styles.subHeader}>1.1. Account Registration</Text>
        <Text style={styles.paragraph}>
          You must register for an account to access certain features. You agree to provide
          accurate, current, and complete information during registration and to keep that
          information up to date. You are responsible for safeguarding your password and
          for any activity under your account.
        </Text>
        <Text style={styles.subHeader}>1.2. Use of the App</Text>
        <Text style={styles.paragraph}>
          You agree to use the app only for lawful purposes. You must not upload, post,
          or transmit any content that is illegal, harmful, or infringes on any third party’s
          rights. We reserve the right to suspend or terminate your account if you violate
          these Terms.
        </Text>
        <Text style={styles.subHeader}>1.3. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of the app (including but not limited to
          text, graphics, logos, and code) are owned by or licensed to us and are protected
          by copyright, trademark, or other intellectual property laws. You may not reproduce,
          distribute, or create derivative works without our prior written consent.
        </Text>
        <Text style={styles.subHeader}>1.4. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your access to the app at any time, with or without
          notice, for any reason, including breach of these Terms. Upon termination, your
          right to use the app will immediately cease.
        </Text>
      </View>

      {/* Privacy Policy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>2. Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We respect your privacy and are committed to protecting your personal information.
          This Privacy Policy explains how we collect, use, and disclose information when you
          use the app.
        </Text>
        <Text style={styles.subHeader}>2.1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          • Personal Data: When you register, we collect your email address and, if you
          choose, a display name and avatar.  
          • Usage Data: We collect information about how you use the app, including
          pages visited and actions taken.  
          • Device Data: We collect device information such as model, operating system,
          and app version.
        </Text>
        <Text style={styles.subHeader}>2.2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to:  
          • Provide and maintain the app’s features.  
          • Communicate with you about updates or support.  
          • Personalize your experience.  
          • Analyze usage trends and improve functionality.
        </Text>
        <Text style={styles.subHeader}>2.3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal data. We may share information with:  
          • Service Providers: Third parties who help us operate the app (e.g., hosting,
          analytics).  
          • Legal Requirements: If required by law or to protect our rights.  
          • Business Transfers: In the event of a merger, acquisition, or sale of assets.
        </Text>
        <Text style={styles.subHeader}>2.4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement reasonable technical and organizational measures to protect your
          data. However, no method of transmission over the internet is 100% secure. We
          cannot guarantee absolute security.
        </Text>
        <Text style={styles.subHeader}>2.5. Your Choices</Text>
        <Text style={styles.paragraph}>
          You can update your profile information (display name, avatar) at any time via the
          Profile screen. To delete your account or request data removal, please contact
          support.
        </Text>
      </View>

      {/* Contact Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>3. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions or concerns about these Terms or our Privacy Policy, please
          contact us at support@example.com.
        </Text>
      </View>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} Gainz. All rights reserved.
      </Text>
</ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 12,
    color: '#aaa',
  },
});