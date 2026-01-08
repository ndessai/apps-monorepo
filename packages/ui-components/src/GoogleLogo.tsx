import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface GoogleLogoProps {
  size?: number;
}

export function GoogleLogo({ size = 20 }: GoogleLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G>
        {/* Blue section - top right */}
        <Path
          fill="#4285F4"
          d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
        />

        {/* Red section - top left */}
        <Path
          fill="#EA4335"
          d="M6.3 14.7l6.4 4.8C14.1 15.2 18.7 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 15.1 2 7.6 7.1 6.3 14.7z"
        />

        {/* Yellow section - bottom left */}
        <Path
          fill="#FBBC05"
          d="M24 46c5.5 0 10.5-2 14.4-5.4l-6.6-5.6c-2.1 1.4-4.8 2.2-7.8 2.2-6 0-11.1-4-12.9-9.4l-6.4 4.9C7.6 40.9 15.1 46 24 46z"
        />

        {/* Green section - bottom right */}
        <Path
          fill="#34A853"
          d="M44.5 20H24v8.5h11.8c-.9 2.8-2.7 5.2-5.2 6.8l6.6 5.6c4.8-4.5 7.8-11.1 7.8-18.4 0-1.3-.2-2.7-.5-4z"
        />
      </G>
    </Svg>
  );
}
