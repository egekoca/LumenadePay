import {LANGUAGES, languageMeta, missingTranslations, translate} from '../src/shared/i18n';
import {useAppStore} from '../src/state/appStore';

/** Every string the screens ask the translator for, in the order a demo hits them. */
const USED = [
  'Scan to pay',
  'Scan a code or hold phones together',
  'Assets',
  'Payments',
  'No payments yet',
  'Finish wallet setup',
  'Create the wallet',
  'Add money',
  'Cash out',
  'Add lira',
  'YOU SEND',
  'YOU GET',
  'Continue',
  'Send and cash out',
  'Reading the rate…',
  'fee',
  'SEND TO',
  'REFERENCE (AÇIKLAMA)',
  'STATUS',
  'Waiting for your bank transfer',
  'Done',
  'Simulate the bank transfer',
  'Go back',
  'Profile',
  'Wallet',
  'WALLET ADDRESS',
  'LANGUAGE',
  'App language',
  'Developer settings',
  'Sign out',
];

describe('the language setting', () => {
  it('starts in English, because that is what every string was written in', () => {
    expect(useAppStore.getState().language).toBe('en');
  });

  it('offers English and Turkish, each with a flag and its own name for itself', () => {
    expect(LANGUAGES.map(l => l.code)).toEqual(['en', 'tr']);
    for (const entry of LANGUAGES) {
      expect(entry.flag).not.toBe('');
      expect(entry.endonym).not.toBe('');
    }
    // A Turkish speaker looks for "Türkçe", not for "Turkish".
    expect(languageMeta('tr').endonym).toBe('Türkçe');
  });

  it('leaves a string alone when the language has no catalogue', () => {
    expect(translate('Scan to pay', 'en')).toBe('Scan to pay');
    expect(translate('Scan to pay', 'de')).toBe('Scan to pay');
  });

  it('translates into Turkish', () => {
    expect(translate('Scan to pay', 'tr')).toBe('Okut ve öde');
    expect(translate('Assets', 'tr')).toBe('Varlıklar');
  });

  /**
   * Keying on the English means an edit to a source string silently drops its
   * translation and the screen quietly reverts to English. This is the alarm:
   * every string the screens actually pass through the translator must have a
   * Turkish entry, or the list below names the ones that do not.
   */
  it('has a Turkish entry for every string the screens translate', () => {
    expect(missingTranslations('tr', USED)).toEqual([]);
  });
});
