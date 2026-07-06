# Workspace Guidelines for prescription_reader

## Outbound-Only Notifications (Phase 1)
- **Strictly Outbound:** The application only sends reminders to users via WhatsApp.
- **No Incoming Messages:** Patients will not reply to messages, and we do not expect incoming interaction.
- **No Webhooks:** Webhook handlers or status logs for incoming replies/delivered notifications are not required and should not be set up in this phase.
- **Template-Based reminders:** All notification deliveries must rely strictly on pre-approved Meta WhatsApp templates.
