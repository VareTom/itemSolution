export class UpstreamInvalidCredentialsError extends Error {
  constructor() {
    super('Invalid upstream credentials')
    this.name = 'UpstreamInvalidCredentialsError'
  }
}

export class UpstreamRequestError extends Error {
  constructor(readonly status: number, readonly path: string) {
    super(`Upstream request failed with status ${status} on ${path}`)
    this.name = 'UpstreamRequestError'
  }
}
