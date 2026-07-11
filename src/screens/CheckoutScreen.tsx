import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../components/common';
import { lightTheme } from '../theme';
import { formatCurrency, validatePhone } from '../utils/helpers';
import { orderService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { clearCart, selectCartTotal } from '../redux/slices/cartSlice';
import { addOrder } from '../redux/slices/orderSlice';
import { PAYMENT_METHODS } from '../constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Checkout'>;

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const total = useAppSelector(selectCartTotal);

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '+94');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Error', 'Please enter shipping address');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (+94XXXXXXXXX)');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          paintingId: item.painting.id,
          title: item.painting.title,
          price: item.painting.price,
          quantity: item.quantity,
          image: item.painting.image,
        })),
        total,
        shippingAddress,
        phone,
        paymentMethod,
      };

      const response = await orderService.create(orderData);

      if (response.success) {
        dispatch(addOrder(response.data));
        dispatch(clearCart());

        Alert.alert(
          'Order Placed Successfully!',
          `Your order #${response.data.id} has been placed successfully.`,
          [
            {
              text: 'View Orders',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'MainTabs',
                      params: { screen: 'Orders' },
                    },
                  ],
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout" onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="location" size={16} color={lightTheme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Shipping Address"
              placeholderTextColor={lightTheme.colors.textTertiary}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="call" size={16} color={lightTheme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (+94XXXXXXXXX)"
              placeholderTextColor={lightTheme.colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.paymentOption,
                paymentMethod === method.value && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method.value)}
              activeOpacity={0.8}
            >
              <View style={styles.radioButton}>
                {paymentMethod === method.value && <View style={styles.radioButtonSelected} />}
              </View>
              <View style={styles.paymentIconWrap}>
                <Ionicons
                  name={method.value === 'cod' ? 'cash-outline' : 'card-outline'}
                  size={18}
                  color={paymentMethod === method.value ? lightTheme.colors.primary : lightTheme.colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.paymentLabel,
                  paymentMethod === method.value && styles.paymentLabelSelected,
                ]}
              >
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({items.length})</Text>
            <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryFree}>Free</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={`Place Order - ${formatCurrency(total)}`}
          onPress={handlePlaceOrder}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    ...lightTheme.shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surfaceAlt,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
    minHeight: 54,
  },
  inputIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lightTheme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: lightTheme.colors.text,
    paddingVertical: 14,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: lightTheme.borderRadius.md,
    backgroundColor: lightTheme.colors.surfaceAlt,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    backgroundColor: lightTheme.colors.primaryLight,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: lightTheme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: lightTheme.colors.primary,
  },
  paymentIconWrap: {
    marginRight: 10,
  },
  paymentLabel: {
    fontSize: 15,
    color: lightTheme.colors.textSecondary,
    fontFamily: lightTheme.fonts.bodySemibold,
  },
  paymentLabelSelected: {
    color: lightTheme.colors.primary,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.text,
  },
  summaryFree: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: lightTheme.colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: lightTheme.colors.surface,
    borderTopLeftRadius: lightTheme.borderRadius.xl,
    borderTopRightRadius: lightTheme.borderRadius.xl,
    ...lightTheme.shadows.medium,
  },
});
