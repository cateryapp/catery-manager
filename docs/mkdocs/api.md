# API Reference

## Specifications
We provide standard specifications for our API surface.

- [OpenAPI Specification](../openapi.yaml) (Synchronous / REST)
- [AsyncAPI Specification](../asyncapi.yaml) (Event-driven)

## Integration Guide
Third parties should integrate using the REST API.
1. Obtain an API Key or JWT (via Login).
2. Set `Authorization: Bearer <token>`.
3. Respect rate limits (standard: 100 req/min).

## SDKs
Currently we do not provide official SDKs, but you can generate clients using the OpenAPI file.
