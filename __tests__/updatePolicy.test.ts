import {needsUpdate, parseUpdatePolicy} from '../src/halabsaudi/updates/policy';
const android = {
  minimumBuild: 43,
  latestVersion: '1.4.3',
  storeUrl:
    'https://play.google.com/store/apps/details?id=com.halabsaudiappreactnativeversion',
};
test('minimum native build gates old releases but permits equal/newer releases', () => {
  const policy = parseUpdatePolicy({enabled: true, android}, 'android');
  expect(needsUpdate('42', policy)).toBe(true);
  expect(needsUpdate('43', policy)).toBe(false);
  expect(needsUpdate('44', policy)).toBe(false);
  expect(needsUpdate('invalid', policy)).toBe(false);
});
test.each([false, undefined, 'true'])(
  'disabled/unconfigured policy cannot lock out users (%s)',
  enabled => {
    expect(parseUpdatePolicy({enabled, android}, 'android')).toBeNull();
  },
);
test.each([0, -1, 43.5, '43', Infinity])(
  'rejects invalid minimum build %s',
  minimumBuild => {
    expect(
      parseUpdatePolicy(
        {enabled: true, android: {...android, minimumBuild}},
        'android',
      ),
    ).toBeNull();
  },
);
test.each([
  'https://evil.example/update',
  'https://play.google.com.evil.example/store/apps/details?id=com.halabsaudiappreactnativeversion',
  'javascript:alert(1)',
  'https://play.google.com/store/apps/details?id=another.app',
])('rejects unsafe/wrong store URL %s', storeUrl => {
  expect(
    parseUpdatePolicy(
      {enabled: true, android: {...android, storeUrl}},
      'android',
    ),
  ).toBeNull();
});
test('platform minima remain independent', () => {
  const data = {
    enabled: true,
    android,
    ios: {
      minimumBuild: 143,
      latestVersion: '1.4.3',
      storeUrl: 'https://apps.apple.com/qa/app/hala/id123456789',
    },
  };
  expect(needsUpdate('142', parseUpdatePolicy(data, 'ios'))).toBe(true);
  expect(needsUpdate('143', parseUpdatePolicy(data, 'ios'))).toBe(false);
  expect(parseUpdatePolicy(data, 'windows')).toBeNull();
});
