import * as Keychain from 'react-native-keychain';
// mongodb+srv://milkbill5788_db_user:milkbook123@cluster0.j9r1cii.mongodb.net/test?retryWrites=true&w=majority
// mongodb+srv://milkbill5788_db_user:milkbook123@cluster0.j9r1cii.mongodb.net/?appName=milkbill
export const BASE_URL = "https://milk-time-backend-utlt.onrender.com/api/v1" // Live url
// export const BASE_URL = "http://192.168.0.103:9000/api/v1" // pg
// export const BASE_URL = "http://192.168.1.8:9000/api/v1" // office
// export const BASE_URL = "http://10.196.86.56:9000/api/v1" //my mobile
// export const BASE_URL = "http://10.88.186.56:9000/api/v1" // bhbi mobile
// export const BASE_URL = "http://192.168.1.80:9000/api/v1" // anand acadmy

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