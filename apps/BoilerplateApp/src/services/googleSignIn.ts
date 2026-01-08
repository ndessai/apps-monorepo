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
const WEB_CLIENT_ID = '750577756888-103oggmsrt8jbaeua15gbfjq79evl3l9.apps.googleusercontent.com';
const IOS_CLIENT_ID = '750577756888-gfb9nrmkuvqi5805uk9l8eab3qvo77bl.apps.googleusercontent.com';

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

    // Check if user cancelled
    if (userInfo.type === 'cancelled') {
      console.log('User cancelled Google Sign-In');
      return null;
    }

    // Success response
    if (userInfo.type === 'success' && userInfo.data) {
      const userData = userInfo.data.user;

      // Use givenName and familyName if available
      const firstName = userData.givenName || '';
      const lastName = userData.familyName || '';

      return {
        id: userData.id,
        email: userData.email || '',
        firstName,
        lastName,
        fullName: userData.name || '',
        photo: userData.photo || undefined,
      };
    }

    throw new Error('No user data returned from Google Sign-In');
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
  return GoogleSignin.hasPreviousSignIn();
}

export async function getCurrentUser(): Promise<GoogleUserData | null> {
  try {
    const userInfo = await GoogleSignin.signInSilently();

    // Check response type
    if (userInfo.type === 'noSavedCredentialFound') {
      return null;
    }

    if (userInfo.type === 'success' && userInfo.data) {
      const userData = userInfo.data.user;

      const firstName = userData.givenName || '';
      const lastName = userData.familyName || '';

      return {
        id: userData.id,
        email: userData.email || '',
        firstName,
        lastName,
        fullName: userData.name || '',
        photo: userData.photo || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
