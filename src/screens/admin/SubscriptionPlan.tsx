import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { BASE_URL, deleteToken } from '../../../token/tokenStorage';
import { useDispatch, useSelector } from 'react-redux';
import { setFirmDetails } from '../../../redux/slices/firmSlice';

const plans = [
  {
    id: 0,
    title: '1 Month Plan',
    price: '100',
    duration: '1 Month',
    months: 1,
  },
  {
    id: 1,
    title: '1 Year Plan',
    price: '1000',
    duration: '1 Year',
    months: 12,
  },
  {
    id: 2,
    title: '2 Years Plan',
    price: '1800',
    duration: '2 years',
    months: 24,
    best: true,
  },
  {
    id: 3,
    title: '5 Years Plan',
    price: '4000',
    duration: '5 years',
    months: 60,
  },
  {
    id: 4,
    title: '10 Years Plan',
    price: '7500',
    duration: '10 years',
    months: 120,
  },
];

const SubscriptionPlan = () => {
    const firm = useSelector((state: any) => state.firm.value);
      const dispatch = useDispatch();
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');
  useEffect(() => {
    getRazorPayKeys();
  }, []);

  const getRazorPayKeys = async () => {
    await fetch(`${BASE_URL}/payment/getKeys`, {
      method: 'GET'
    })
      .then(async (x: any) => {
        const data = await x.json();
        setRazorpayKeyId(data.data.RAZORPAY_API_KEY)
      })
      .catch(e => {
        console.log('getkey data : ', e);
      });
  };

  const handleSelectPlan = async (plan) => {
    try {
      // Call backend to create order
      const res = await fetch(`${BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(plan.price),
        }),
      });

      const {data} = await res.json();

      console.log("order res : ",data);
      

      const options = {
        description: plan.title,
        currency: 'INR',
        key: razorpayKeyId,
        amount: data.amount,
        order_id: data.id,

        name: 'Milk Bill App',
         image: 'https://drive.google.com/file/d/17GfOVBkvxbUT-46MtO29MPEUJnA7Q-bq/view?usp=drive_link',

        notes: {
          firmId: firm.id,
          months: plan.months,
        },

        theme: { color: '#5086E7' },
      };

      RazorpayCheckout.open(options)
        .then(async() => {
          await deleteToken()
              const firmData = {
                name: '',
                id: '',
                role: '',
              };
              dispatch(setFirmDetails(firmData));
        })
        .catch(error => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Choose Your Plan</Text>
      <Text style={styles.subHeading}>
        Continue using Milk Billing without interruption
      </Text>

      {plans.map(plan => (
        <TouchableOpacity
          key={plan.id}
          style={[styles.card, plan.best && styles.bestCard]}
          onPress={() => handleSelectPlan(plan)}
        >
          {plan.best && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestText}>BEST VALUE</Text>
            </View>
          )}

          <Text style={styles.planTitle}>{plan.title}</Text>

          <Text style={styles.price}>₹{plan.price}</Text>

          <Text style={styles.duration}>{plan.duration}</Text>

          <View style={styles.button}>
            <Text style={styles.buttonText}>Select Plan</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default SubscriptionPlan;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F4F7FF',
    paddingBottom: 40,
  },

  heading: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
    color: '#5086E7',
  },

  subHeading: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6ECFF',
  },

  bestCard: {
    borderColor: '#5086E7',
    borderWidth: 2,
  },

  bestBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#5086E7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },

  bestText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },

  price: {
    fontSize: 30,
    fontWeight: '700',
    color: '#5086E7',
    marginVertical: 8,
  },

  duration: {
    color: '#777',
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#5086E7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
