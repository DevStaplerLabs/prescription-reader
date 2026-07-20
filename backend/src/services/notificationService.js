import dotenv from 'dotenv';

// Ensure env variables are loaded if not already
dotenv.config();

const API_VERSION = 'v25.0';

/**
 * Sends a template-based WhatsApp message using the WhatsApp Business Cloud API.
 * 
 * @param {string} to - The recipient's phone number (with country code, e.g., "919876543210").
 * @param {string} templateName - The name of the approved WhatsApp template (e.g., "hello_world").
 * @param {Array<object>} [components=[]] - The components containing template parameter values.
 * @param {string} [languageCode="en_US"] - The language code of the template.
 * @returns {Promise<object>} The API response data.
 */
export const sendWhatsAppTemplate = async (to, templateName, components = [], languageCode = 'en') => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    throw new Error('WhatsApp configuration missing: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set.');
  }

  // Clean the phone number (remove +, spaces, dashes, etc.)
  const cleanTo = to.replace(/[^0-9]/g, '');

  const url = `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanTo,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  if (components && components.length > 0) {
    payload.template.components = components;
  }

  console.log(`[WhatsApp Service] Sending template "${templateName}" to ${cleanTo} using language code "${languageCode}"...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[WhatsApp Service] Error response:', data);
    throw new Error(`WhatsApp API failed: ${data.error?.message || 'Unknown error'}`);
  }

  console.log('[WhatsApp Service] Message sent successfully:', data.messages?.[0]?.id);
  return data;
};

/**
 * Helper function to send a medication reminder using a configured template.
 * 
 * @param {string} to - Recipient's phone number.
 * @param {string} patientName - Name of the patient.
 * @param {string} scheduledTime - Time of the scheduled dose (e.g. "08:00 AM").
 * @param {Array<{drugName: string, dosage?: string, form?: string}>} medications - Medicines due at this time.
 * @param {string} [templateName="medication_reminder_v3"] - Template name.
 */
export const sendMedicationReminder = async (
  to,
  patientName,
  scheduledTime,
  medications,
  templateName = 'medication_reminder_v3',
) => {
  const medicineList = medications
    .map((med) => {
      const dosage = med.dosage || (med.form ? `1 ${med.form}` : '');
      return `• ${med.drugName}${dosage ? `, ${dosage}` : ''}`;
    })
    .join('\n');

  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: patientName },
        { type: 'text', text: scheduledTime },
        { type: 'text', text: medicineList },
      ],
    },
  ];

  return sendWhatsAppTemplate(to, templateName, components);
};

/**
 * Sends a welcome/onboarding message to a new user.
 * 
 * @param {string} to - Recipient's phone number.
 * @param {string} patientName - Name of the patient.
 * @param {string} [templateName="onboarding_v1"] - Template name.
 */
export const sendOnboardingMessage = async (to, patientName, templateName = 'onboarding_v1') => {
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: patientName }
      ]
    }
  ];

  return sendWhatsAppTemplate(to, templateName, components);
};

