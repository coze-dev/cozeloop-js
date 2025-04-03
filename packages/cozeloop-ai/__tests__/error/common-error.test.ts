import {
  PropertyUnprovidedError,
  type PropertyUnprovidedErrorDetail,
} from '../../src/error';

describe('PropertyUnprovidedError', () => {
  it('should create an instance with correct message when tag is provided', () => {
    const detail: PropertyUnprovidedErrorDetail = {
      tag: 'Config',
      propName: 'apiKey',
      envKey: 'API_KEY',
    };
    const error = new PropertyUnprovidedError(detail);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      '[Config] apiKey not provided, neither pass it or set it via process.env.API_KEY',
    );
  });

  it('should create an instance with correct message when tag is not provided', () => {
    const detail: PropertyUnprovidedErrorDetail = {
      propName: 'databaseUrl',
      envKey: 'DATABASE_URL',
    };
    const error = new PropertyUnprovidedError(detail);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      'databaseUrl not provided, neither pass it or set it via process.env.DATABASE_URL',
    );
  });

  it('should handle empty tag', () => {
    const detail: PropertyUnprovidedErrorDetail = {
      tag: '',
      propName: 'secretKey',
      envKey: 'SECRET_KEY',
    };
    const error = new PropertyUnprovidedError(detail);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      'secretKey not provided, neither pass it or set it via process.env.SECRET_KEY',
    );
  });

  it('should handle special characters in propName and envKey', () => {
    const detail: PropertyUnprovidedErrorDetail = {
      tag: 'Test',
      propName: 'special@PropName',
      envKey: 'SPECIAL_ENV_KEY!@#',
    };
    const error = new PropertyUnprovidedError(detail);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      '[Test] special@PropName not provided, neither pass it or set it via process.env.SPECIAL_ENV_KEY!@#',
    );
  });
});
