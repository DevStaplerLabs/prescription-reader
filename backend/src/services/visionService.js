/**
 * Extracts raw text from an image buffer using Google Cloud Vision REST API directly.
 * Uses direct HTTP calls instead of the @google-cloud/vision library to avoid
 * metadata server hangs in non-GCP environments like Railway/Docker.
 * 
 * @param {Buffer} imageBuffer - The buffer of the uploaded image
 * @returns {Promise<string>} The extracted text
 */
export const extractTextFromImage = async (imageBuffer) => {
  const apiKey = process.env.GOOGLE_VISION_API;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_google_vision_api_key_here') {
    throw new Error('GOOGLE_VISION_API key is not configured.');
  }

  if (!imageBuffer) {
    throw new Error('No image buffer provided');
  }

  const base64Image = imageBuffer.toString('base64');

  const requestBody = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
      },
    ],
  };

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Vision REST API error ${response.status}: ${errData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const annotation = data?.responses?.[0]?.fullTextAnnotation;
    return annotation ? annotation.text : '';
  } catch (error) {
    console.error('[visionService] REST API error:', error.message);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};
