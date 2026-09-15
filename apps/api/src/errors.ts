export class ApiException extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export class ProviderException extends ApiException {
  constructor(
    status: number,
    message = "Market data is temporarily unavailable",
  ) {
    super(
      status === 429 ? 503 : 502,
      status === 429 ? "PROVIDER_RATE_LIMITED" : "PROVIDER_ERROR",
      message,
    );
  }
}
