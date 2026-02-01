# Integrations

## Messaging
- **Email**: Transactional emails (invites, alerts) via SMTP/API providers.
- **WhatsApp**: Planned integration for staff coordination.

## Transcription
Meeting notes and calls can be transcribed and attached to Event timelines.

## Webhooks
Catery can emit webhooks for key domain events.
- **Delivery**: At-least-once guarantee.
- **Retries**: Exponential backoff for failed deliveries.
- **Security**: HMACC signatures on payloads.

## Retry Handling
- **Transient Failures**: Automatic retry for network glitches.
- **Dead Letters**: Failed events after max retries are moved to DLQ for manual inspection.
