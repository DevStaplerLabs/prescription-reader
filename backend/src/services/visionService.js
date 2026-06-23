import vision from '@google-cloud/vision';

// Initialize client with API key from environment variables
const client = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_VISION_API,
});

/**
 * Extracts raw text from an image buffer using Google Cloud Vision API (DOCUMENT_TEXT_DETECTION)
 * @param {Buffer} imageBuffer - The buffer of the uploaded image
 * @returns {Promise<string>} The extracted text
 */
export const extractTextFromImage = async (imageBuffer) => {
  try {
    if (!imageBuffer) {
      throw new Error('No image buffer provided');
    }
    
    const [result] = await client.documentTextDetection({
      image: { content: imageBuffer },
    });
    
    const fullTextAnnotation = result.fullTextAnnotation;
    return fullTextAnnotation ? fullTextAnnotation.text : '';
  } catch (error) {
    console.error('Vision API error:', error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};
