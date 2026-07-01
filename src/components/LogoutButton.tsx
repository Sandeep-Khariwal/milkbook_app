import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { deleteToken } from '../../token/tokenStorage';
import { useDispatch } from 'react-redux';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import IconLogout from 'react-native-vector-icons/AntDesign';

const LogoutButton = (props: { showText: boolean }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    setModalVisible(false);
    await deleteToken();
    const firmData = { name: '', id: '', role: '' };
    dispatch(setFirmDetails(firmData));
  };

  return (
    <View style={styles.wrapper}>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <IconLogout name="logout" size={18} color="#ef4444" />
        </View>
        {props.showText && <Text style={styles.triggerText}>Sign Out</Text>}
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.alertBox}>
              <View style={styles.warningIconCircle}>
                <IconLogout name="exclamationcircleo" size={30} color="#ef4444" />
              </View>
              
              <Text style={styles.title}>Confirm Logout</Text>
              <Text style={styles.subtitle}>
                Are you sure you want to sign out? You will need to login again to access your data.
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleLogout}
                >
                  <Text style={styles.confirmBtnText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default LogoutButton;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2', // Soft red tint
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  triggerText: {
    color: '#e11d48',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 12,
  },
  // Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Slate-900 with opacity
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  warningIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});