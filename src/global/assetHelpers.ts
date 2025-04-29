// src/global/assetHelpers.ts

export function getAssetPath(relativePath: string): string {
    // Ensure no leading slash (safe for concatenation)
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  
    // Determine if we are running in production
    const isProduction = window.location.pathname.startsWith('/sequenzia');
  
    // Choose base URL
    const baseUrl = isProduction ? '/sequenzia/' : './';
  
    return baseUrl + cleanPath;
  }
  