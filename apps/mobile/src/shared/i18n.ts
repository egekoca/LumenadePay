import {useAppStore} from '../state/appStore';

/**
 * The languages the app is offered in.
 *
 * English is the default because it is the language every string was written
 * in, and a half-translated screen reads worse than an untranslated one.
 * Turkish is here because the money this app is built around is lira and the
 * people counting in it should not have to read about it in English.
 */
export const LANGUAGES = [
  {code: 'en', flag: '🇬🇧', name: 'English', endonym: 'English'},
  {code: 'tr', flag: '🇹🇷', name: 'Turkish', endonym: 'Türkçe'},
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export function languageMeta(code: string) {
  return LANGUAGES.find(entry => entry.code === code) ?? LANGUAGES[0];
}

/**
 * The Turkish strings, keyed by the English they replace.
 *
 * Keying on the source text rather than on invented identifiers means an
 * untranslated string still says something true — it falls through as the
 * English it already was — and a translator can read the file without holding
 * the app in their head. The cost is that editing an English string silently
 * drops its translation, which `missingTranslations` is here to catch.
 */
const TR: Record<string, string> = {
  // Wallet
  'Scan to pay': 'Okut ve öde',
  'Scan a code or hold phones together': 'Kodu okut ya da telefonları birbirine yaklaştır',
  Assets: 'Varlıklar',
  Payments: 'Ödemeler',
  'No payments yet': 'Henüz ödeme yok',
  'Your payment history will appear here.': 'Ödeme geçmişiniz burada görünecek.',
  'Get paid with this account': 'Bu hesapla ödeme al',
  'Stellar Lumens': 'Stellar Lumens',
  'USD Coin': 'USD Coin',
  'Show balance in': 'Bakiyeyi şu para biriminde göster',
  'Finish wallet setup': 'Cüzdan kurulumunu tamamla',
  'Create the wallet': 'Cüzdanı oluştur',

  // Lira
  'Add money': 'Para yükle',
  'Cash out': 'Paraya çevir',
  'Add lira': 'Lira yükle',
  'YOU SEND': 'GÖNDERDİĞİNİZ',
  'YOU GET': 'ALDIĞINIZ',
  Continue: 'Devam',
  'Send and cash out': 'Gönder ve paraya çevir',
  'Reading the rate…': 'Kur okunuyor…',
  fee: 'komisyon',
  'SEND TO': 'ŞURAYA GÖNDERİN',
  'REFERENCE (AÇIKLAMA)': 'AÇIKLAMA',
  'Write this in the transfer description. It is what routes the money to your wallet.':
    'Havale açıklamasına bunu yazın. Parayı cüzdanınıza yönlendiren şey budur.',
  STATUS: 'DURUM',
  'Waiting for your bank transfer': 'Banka havaleniz bekleniyor',
  'The anchor has your lira and is converting it': 'Anchor liranızı aldı, çeviriyor',
  'The anchor has your USDC and is paying the lira out': 'Anchor USDC’nizi aldı, lirayı ödüyor',
  'Sending the USDC to your wallet': 'USDC cüzdanınıza gönderiliyor',
  Done: 'Tamamlandı',
  'The anchor could not finish this transfer': 'Anchor bu transferi tamamlayamadı',
  'Simulate the bank transfer': 'Banka havalesini simüle et',
  'Go back': 'Geri dön',

  // Profile
  Profile: 'Profil',
  Wallet: 'Cüzdan',
  ACCOUNT: 'HESAP',
  'WALLET ADDRESS': 'CÜZDAN ADRESİ',
  LANGUAGE: 'DİL',
  'App language': 'Uygulama dili',
  'Developer settings': 'Geliştirici ayarları',
  'Sign out': 'Çıkış yap',
  'Erases this account and its key from this phone.':
    'Bu hesabı ve anahtarını bu telefondan siler.',
  'No email': 'E-posta yok',
  'Copy address': 'Adresi kopyala',
};

const CATALOGUES: Record<string, Record<string, string>> = {tr: TR};

/** Translates one string, falling through to the English it was written in. */
export function translate(text: string, language: string): string {
  return CATALOGUES[language]?.[text] ?? text;
}

/**
 * The translator for the current language.
 *
 * A hook rather than a global so a language change repaints, which is the
 * whole point of the setting.
 */
export function useTranslate(): (text: string) => string {
  const language = useAppStore(state => state.language);
  return text => translate(text, language);
}

/** Strings a catalogue has no entry for, so a test can name what is missing. */
export function missingTranslations(language: string, texts: readonly string[]): string[] {
  const catalogue = CATALOGUES[language];
  if (!catalogue) return [...texts];
  return texts.filter(text => catalogue[text] === undefined);
}
