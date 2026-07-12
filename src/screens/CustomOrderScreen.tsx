import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Header,
  PrimaryButton,
  ImagePickerField,
  LoadingSpinner,
  EmptyState,
} from '../components/common';
import { lightTheme } from '../theme';
import { CANVAS_SIZES } from '../constants';
import { formatCurrency, formatDate } from '../utils/helpers';
import { customOrderService } from '../api/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CustomOrder } from '../types';

type Props = NativeStackScreenProps<any, 'CustomOrder'>;

const STATUS_META: Record<
  CustomOrder['status'],
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending Review', color: '#B9840A', bg: '#FBF0DC' },
  'in-progress': { label: 'In Progress', color: '#3E6FBD', bg: '#E4ECFA' },
  completed: { label: 'Completed', color: lightTheme.colors.success, bg: lightTheme.colors.successLight },
  rejected: { label: 'Rejected', color: lightTheme.colors.error, bg: lightTheme.colors.errorLight },
  cancelled: { label: 'Cancelled', color: lightTheme.colors.textTertiary, bg: lightTheme.colors.surfaceAlt },
};

export const CustomOrderScreen: React.FC<Props> = ({ navigation }) => {
  const [tab, setTab] = useState<'new' | 'mine'>('new');

  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [referenceImage, setReferenceImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [requests, setRequests] = useState<CustomOrder[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (tab === 'mine') {
      loadRequests();
    }
  }, [tab]);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await customOrderService.getMine();
      if (res.success) setRequests(res.data);
    } catch (error) {
      // ignore
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please describe the artwork you would like');
      return;
    }
    const budgetNum = Number(budget);
    if (!budget || Number.isNaN(budgetNum) || budgetNum <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await customOrderService.create({
        description: description.trim(),
        budget: budgetNum,
        canvasSize,
        image: referenceImage || undefined,
      });

      if (res.success) {
        setDescription('');
        setBudget('');
        setCanvasSize(CANVAS_SIZES[0]);
        setReferenceImage('');
        Alert.alert(
          'Request Submitted',
          'Your custom artwork request has been sent to our team. We will review it and get back to you.',
          [{ text: 'View My Requests', onPress: () => setTab('mine') }, { text: 'OK' }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (request: CustomOrder) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this custom artwork request?',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await customOrderService.cancel(request.id);
              if (res.success) {
                setRequests((prev) =>
                  prev.map((r) => (r.id === request.id ? res.data : r))
                );
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  const renderNewRequestForm = () => (
    <ScrollView
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heroTitle}>Request a Custom Painting</Text>
      <Text style={styles.heroSubtitle}>
        Tell us your vision and one of our artists will bring it to life.
      </Text>

      <ImagePickerField value={referenceImage} onChange={setReferenceImage} />

      <Text style={styles.label}>Describe your artwork *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. A sunset seascape with warm orange tones, similar to impressionist style..."
        placeholderTextColor={lightTheme.colors.textTertiary}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Budget (LKR) *</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        placeholder="25000"
        placeholderTextColor={lightTheme.colors.textTertiary}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Canvas Size</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizeScroll}>
        {CANVAS_SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.sizeChip, canvasSize === size && styles.sizeChipSelected]}
            onPress={() => setCanvasSize(size)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.sizeChipText, canvasSize === size && styles.sizeChipTextSelected]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <PrimaryButton
        title="Submit Request"
        onPress={handleSubmit}
        loading={submitting}
        icon={<Ionicons name="paper-plane-outline" size={17} color="#fff" />}
        style={styles.submitButton}
      />
    </ScrollView>
  );

  const renderMyRequests = () => {
    if (loadingRequests) {
      return <LoadingSpinner message="Loading your requests..." />;
    }

    if (requests.length === 0) {
      return (
        <EmptyState
          icon="color-palette-outline"
          title="No Requests Yet"
          message="Submit a custom artwork request and it will appear here"
          actionLabel="Create Request"
          onAction={() => setTab('new')}
        />
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {requests.map((request) => {
          const meta = STATUS_META[request.status];
          return (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestTopRow}>
                {request.image ? (
                  <Image source={{ uri: request.image }} style={styles.requestImage} />
                ) : (
                  <View style={[styles.requestImage, styles.requestImagePlaceholder]}>
                    <Ionicons name="image-outline" size={22} color={lightTheme.colors.textTertiary} />
                  </View>
                )}
                <View style={styles.requestInfo}>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description}
                  </Text>
                  <Text style={styles.requestMeta}>
                    {formatCurrency(request.budget)} · {request.canvasSize}
                  </Text>
                  <Text style={styles.requestDate}>Submitted {formatDate(request.createdAt)}</Text>
                </View>
              </View>

              {request.adminNote ? (
                <View style={styles.noteBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={lightTheme.colors.accent} />
                  <Text style={styles.noteText}>{request.adminNote}</Text>
                </View>
              ) : null}

              {request.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelRequestButton}
                  onPress={() => handleCancel(request)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelRequestText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Custom Artwork" onBackPress={() => navigation.goBack()} />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'new' && styles.tabButtonActive]}
          onPress={() => setTab('new')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'new' && styles.tabTextActive]}>New Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'mine' && styles.tabButtonActive]}
          onPress={() => setTab('mine')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>My Requests</Text>
        </TouchableOpacity>
      </View>

      {tab === 'new' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {renderNewRequestForm()}
        </KeyboardAvoidingView>
      ) : (
        renderMyRequests()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  flex: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: lightTheme.colors.surfaceAlt,
    borderRadius: lightTheme.borderRadius.md,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: lightTheme.colors.surface,
    ...lightTheme.shadows.small,
  },
  tabText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: lightTheme.colors.text,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: lightTheme.fonts.display,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 19,
  },
  label: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 14,
  },
  sizeScroll: {
    marginBottom: 24,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: lightTheme.borderRadius.round,
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    marginRight: 10,
  },
  sizeChipSelected: {
    backgroundColor: lightTheme.colors.primary,
    borderColor: lightTheme.colors.primary,
  },
  sizeChipText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyMedium,
    color: lightTheme.colors.textSecondary,
  },
  sizeChipTextSelected: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 4,
  },
  requestCard: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  requestTopRow: {
    flexDirection: 'row',
  },
  requestImage: {
    width: 72,
    height: 72,
    borderRadius: lightTheme.borderRadius.md,
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  requestImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: lightTheme.borderRadius.round,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  requestDescription: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyMedium,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  requestMeta: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
  },
  requestDate: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textTertiary,
    marginTop: 2,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: lightTheme.colors.primaryLight,
    borderRadius: lightTheme.borderRadius.sm,
    padding: 10,
    marginTop: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.text,
    lineHeight: 17,
  },
  cancelRequestButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  cancelRequestText: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.error,
  },
});
