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
    // Validation
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
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
            <Ionicons name="location" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Shipping Address"
              placeholderTextColor="#BDBDBD"
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (+94XXXXXXXXX)"
              placeholderTextColor="#BDBDBD"
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
            >
              <View style={styles.radioButton}>
                {paymentMethod === method.value && <View style={styles.radioButtonSelected} />}
              </View>
              <Ionicons
                name={method.value === 'cod' ? 'cash-outline' : 'card-outline'}
                size={24}
                color={paymentMethod === method.value ? lightTheme.colors.primary : '#757575'}
                style={styles.paymentIcon}
              />
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
            <Text style={styles.summaryValue}>Free</Text>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    paddingVertical: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: lightTheme.colors.primary,
    backgroundColor: '#F3E5F5',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: lightTheme.colors.primary,
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  paymentLabelSelected: {
    color: lightTheme.colors.primary,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: lightTheme.colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
});
