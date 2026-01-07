import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export interface GoogleUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photo?: string;
}

// TODO: Replace with your actual Google Cloud Console Client IDs
// Instructions: https://github.com/react-native-google-signin/google-signin/blob/master/docs/get-config-file.md
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID, // From Google Cloud Console
    iosClientId: IOS_CLIENT_ID, // From Google Cloud Console
    offlineAccess: false,
  });
}

export async function signInWithGoogle(): Promise<GoogleUserData | null> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.user) {
      throw new Error('No user data returned from Google Sign-In');
    }

    const user = userInfo.data.user;

    // Parse first and last name from full name
    const nameParts = (user.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return {
      id: user.id,
      email: user.email || '',
      firstName,
      lastName,
      fullName: user.name || '',
      photo: user.photo || undefined,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled Google Sign-In');
      return null;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google Sign-In is already in progress');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('Play Services not available or outdated');
      throw new Error('Google Play Services not available');
    } else {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
}

export async function isSignedIn(): Promise<boolean> {
  return await GoogleSignin.isSignedIn();
}

export async function getCurrentUser(): Promise<GoogleUserData | null> {
  try {
    const userInfo = await GoogleSignin.signInSilently();

    if (!userInfo.data?.user) {
      return null;
    }

    const user = userInfo.data.user;
    const nameParts = (user.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return {
      id: user.id,
      email: user.email || '',
      firstName,
      lastName,
      fullName: user.name || '',
      photo: user.photo || undefined,
    };
  } catch (error) {
    return null;
  }
}
