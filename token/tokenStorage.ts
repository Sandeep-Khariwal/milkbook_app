import * as Keychain from 'react-native-keychain';
// export const BASE_URL = "https://milk-time-backend-utlt.onrender.com/api/v1" // Live url
export const BASE_URL = "http://72.61.251.156:9000/api/v1" // hostinger Live url
// export const BASE_URL = "http://192.168.0.102:9000/api/v1" // pg
// export const BASE_URL = "http://192.168.1.8:9000/api/v1" // office

export async function saveToken(token: string) {
  try {
    await Keychain.setGenericPassword('auth', token);
    console.log('✅ Token saved securely');
  } catch (error) {
    console.error('❌ Error saving token:', error);
  }
}


export async function getToken() {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log('🔐 Token found:', credentials.password);
      return credentials.password; // your saved token
    } else {
      console.log('🚫 No token found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
}

export async function deleteToken() {
  try {
    await Keychain.resetGenericPassword();
    console.log('🧹 Token deleted');
  } catch (error) {
    console.error('Error deleting token:', error);
  }
}