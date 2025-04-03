import { setupJwtAuthMock } from '../mock/jwt-auth';
import { simpleConsoleLogger } from '../../src/utils/logger';
import { OAuthJWTFlow } from '../../src/auth';

// this is a FAKE private key, DO NOT USE IT EXCEPTE FOR TEST
const FAKE_PRAIVTE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDe21/51r0YRcok
fvq6G8FnJtj7QyRXF5CzCENmdgQt4OhjvhzQX9t6J10n3y93q9yI283Y6hrShNAJ
RrpoGfwOmBGut3feF/shoDqes8ZrgpdDkhV0E4QFRySxmH8I6oSHFN2Mo/8Wvjz1
ok+Mov8P3SNzXKBdod2WwO/iM5JtoM+/b/edqyH/REWtDQAzi9i9rGYlEptFh1Ef
GZVQY+Fe8O7oXhN9ndxmDAqpWvg14foQV9ccd7oeY366sQKyjUVysnlsismVbIKP
SRcE0i4WDyAEFdo/7YREQ+QlXQdHI+k2lL8syRCs0yuxJwrtLc3jsdsrOV95t074
fZ66F40bAgMBAAECggEAH/pinzsNDzqUcwA1ghcRfXe5kvRjdovPG6GH6l/s4Zhw
QD+7arsWh0S2vU3tRcLHdmvz8bhF+QdNwsb/YIi5/m4bu3JgJOJUCtMvFi69vheT
FQMVSP6z5v36afFz6RedxLRdxhySMfVCUgzkVU3eQ6x7tcYIzOa5ITS2N0MnM8um
8SFUnT9+4HbKruRv2r58wGFVBXbVrfmGExEHjXkW40uEsXuGjDc3OMvtL0WTTYbA
wV7ZZv/dkxeEEpeToT7gczLc1pEeirjpg8fppM7FDLrY57BMbSitK7d9IBQmCft4
HPhPRA1ghj17PvQkRDj+DJRVFYcL35eQ3ekSwLgSwQKBgQD1YX/d+NiBV1c7Yyba
Zf7txVaFZRfiaMpAhe34MhjQgXNtDc6Ba2mT9+oAEoHP+JD5+3oL+mxcHxFfDDdJ
np9Vso1j0aqfVipkTlVSlmVLqwximguGAfUAZY9Nn3At2mvzByZVBDxt35K9thW4
0ChsnYDJq/p/+PLBAj9tji+SqQKBgQDogFb0HZQfFAIUQrx6GyAKsBW0I0pz6bfW
N6Ekuhjbm4vhiml1VMv7VfuMoCM9txuw6k0cwAJQTjx6OHLNavkbJB/bT1yYjouA
45hC1TTBcCGev0Sw3h4gqR0Za6Xnhbjidtn9zZvdZRkwVlWBzBTjrnF8YFE8v/Bs
tdYTSXKAIwKBgQDQAqrmfIDshCHKki7pjPUiktrZke1BXRu2vtIQSEeI2XQDymR4
iZmiedK/5PBuYIRlpay8YrlhDmUnca+clP71IruBFsfQ8rZU+aKStDOChammHHgQ
TbBnebCVWMc716ETD8iK4WBos9ItSCH53VunV41JaKSdv2fp/gHO2W2yoQKBgCAO
ce6+lUmjrJW2jd4YF1bh6Fwp8X4B34L9sI4rynmc/LBgMSIoSuegd0pwWeuMb5j4
9SDdqHQCFXyUg9+mvCnt1SabzpyKKtneh4PPebKiD0CgBoyMU4MVThnPKdS+Lzuq
P2wrCS6BXfO4M5nt1YN+7c7ESO8jV7bla1rFabAZAoGBAOXDbw1IjOdTeTz1ynnc
g1JJtpGE7szwBwzrvc4QhGhckx6ezQFzlXdvDd0PRV8EH3Ubfz/p0iJS5vmVMo0f
KGWXsNrnM3KOgpDYJn5tEbJQVcxu+2nmkPUTuSYOPTAf+DiCOn5rBvMRThPpPKSj
MnCEnZh1FEYYjc93iTmStwNy
-----END PRIVATE KEY-----`;

describe('Test oauth-jwt <JWT Authorization>', () => {
  const httpMock = setupJwtAuthMock();
  beforeAll(() => httpMock.start());
  afterAll(() => httpMock.close());
  afterEach(() => httpMock.reset());

  it('base', async () => {
    const authFlow = new OAuthJWTFlow({
      baseURL: 'https://api.coze.cn',
      appId: 'fake_app_id',
      aud: 'api.coze.cn',
      keyid: 'mbt6VMdJ08b1UXN3Ju3NeFandJJ-E2csIany35A4QC0',
      privateKey: FAKE_PRAIVTE_KEY,
      logger: simpleConsoleLogger,
    });

    const tokenResp = await authFlow.getToken();
    expect(tokenResp.access_token).toBe('fake_access_token');
  });
});
