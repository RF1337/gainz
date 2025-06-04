// app/faq.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function FAQScreen() {
  const faqs = [
    {
      question: 'How do I create an account?',
      answer:
        'To create an account, tap Sign Up on the welcome screen, enter your email and password, and follow the instructions. You’ll receive a verification email—click the link inside to verify your email address.',
    },
    {
      question: 'I forgot my password. What should I do?',
      answer:
        'On the Sign In screen, tap "Forgot Password". Enter the email address associated with your account. We’ll send you a reset link—follow that link to choose a new password.',
    },
    {
      question: 'How do I change my display name or avatar?',
      answer:
        'Go to Settings → Profile. Tap the “Display Name” field to edit your name. To change your avatar, tap “Upload” under the avatar circle, pick a new image, and save.',
    },
    {
      question: 'Can I sign in with Google or Apple?',
      answer:
        'Yes. From the Sign In screen, tap “Sign in with Google” or “Sign in with Apple.” Follow the prompts to authenticate. Once you grant permissions, you’ll be logged in automatically.',
    },
    {
      question: 'How do I delete my account?',
      answer:
        'Please contact support if you need to delete your account. Go to Settings → More → Contact Support for instructions on account deletion.',
    },
    {
      question: 'Where can I learn more about the app’s features?',
      answer:
        'Visit our Help Center via the “Help” link in Settings → More. You’ll find step-by-step guides, video tutorials, and troubleshooting tips for every feature.',
    },
  ];

  // Track which items are expanded
  const [expanded, setExpanded] = useState<boolean[]>(
    faqs.map(() => false)
  );

  const toggleExpand = (index: number) => {
    setExpanded((prev) =>
      prev.map((item, idx) => (idx === index ? !item : item))
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Frequently Asked Questions</Text>
      {faqs.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <Pressable
            style={styles.questionButton}
            onPress={() => toggleExpand(index)}
          >
            <Text style={styles.questionText}>{item.question}</Text>
            <Ionicons
              name={expanded[index] ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </Pressable>
          {expanded[index] && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>{item.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
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
  faqItem: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  questionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  answerContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});