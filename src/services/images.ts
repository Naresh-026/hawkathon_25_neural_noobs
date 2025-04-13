import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function generateRequestImage(title: string, category: string): Promise<string> {
  try {
    console.log('Attempting to generate image for:', { title, category });

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, category }),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return '';
    }

    const data = await response.json();
    console.log('API response data:', data);

    if (!data.imageData) {
      console.error('No image data in response');
      return '';
    }

    // The API returns base64 data, we'll store it directly
    console.log('Image generation result:', data.imageData.substring(0, 50) + '...');
    return data.imageData;
  } catch (error) {
    console.error('Error in generateRequestImage:', error);
    return '';
  }
} 