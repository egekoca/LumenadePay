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
  // Welcome and setup
  'Pay by scanning.': 'Okut ve öde.',
  'Settle on Stellar.': 'Stellar üzerinde ödeş.',
  'One app for both sides of the counter. Your money moves on Stellar, and only this phone can approve it.':
    'Tezgâhın iki tarafı için tek uygulama. Paranız Stellar üzerinde hareket eder ve yalnızca bu telefon onaylayabilir.',
  "Scan a merchant's code to pay": 'Ödemek için satıcının kodunu okutun',
  'Or hold the two phones together': 'Ya da iki telefonu birbirine yaklaştırın',
  'Approved with your face or fingerprint': 'Yüzünüz veya parmak izinizle onaylanır',
  'Create a new wallet': 'Yeni cüzdan oluştur',
  'I already have a wallet': 'Zaten cüzdanım var',
  'No password to remember. Twelve words are your wallet, and they are what lets you add money in lira.':
    'Ezberlenecek parola yok. On iki kelime cüzdanınızdır ve lira yüklemenizi sağlayan şey odur.',
  'Set up your account': 'Hesabınızı kurun',
  'Restore your wallet': 'Cüzdanınızı geri yükleyin',
  'Your name': 'Adınız',
  'Email (optional)': 'E-posta (isteğe bağlı)',
  'Only used to send you a receipt. It is not a login.':
    'Yalnızca makbuz göndermek için. Giriş bilgisi değildir.',
  'Your name is what a merchant sees on a receipt. Everything else stays on this phone.':
    'Satıcı makbuzda adınızı görür. Kalan her şey bu telefonda kalır.',
  'Twelve words are your wallet': 'On iki kelime cüzdanınızdır',
  'Your existing wallet': 'Mevcut cüzdanınız',
  'That does not look like an email address': 'Bu bir e-posta adresine benzemiyor',
  'Please enter the name a merchant should see': 'Satıcının göreceği adı girin',

  // Recovery phrase
  'Your recovery phrase': 'Kurtarma cümleniz',
  'These twelve words are your wallet. Write them down on paper, in this order, and keep them somewhere only you can reach.':
    'Bu on iki kelime cüzdanınızdır. Kâğıda bu sırayla yazın ve yalnızca sizin ulaşabileceğiniz bir yerde saklayın.',
  'I have written them down': 'Yazdım',
  'Check your phrase': 'Cümlenizi doğrulayın',
  'Tap the word that belongs in each place.': 'Her sıraya ait kelimeye dokunun.',
  'Create my wallet': 'Cüzdanımı oluştur',
  'Show the words again': 'Kelimeleri tekrar göster',

  // Import
  'Recovery phrase': 'Kurtarma cümlesi',
  'Secret key': 'Gizli anahtar',
  'Enter the recovery phrase from your existing Stellar wallet. It never leaves this phone.':
    'Mevcut Stellar cüzdanınızın kurtarma cümlesini girin. Bu telefondan asla çıkmaz.',
  'The key that starts with an S, not the address that starts with a G':
    'G ile başlayan adres değil, S ile başlayan anahtar',
  'Is this your account?': 'Hesabınız bu mu?',
  'Yes, use this wallet': 'Evet, bu cüzdanı kullan',
  'No, let me check again': 'Hayır, tekrar kontrol edeyim',
  'STELLAR ACCOUNT': 'STELLAR HESABI',

  // Unlock
  'Set up this device again': 'Bu cihazı yeniden kur',
  'Welcome back': 'Tekrar hoş geldiniz',

  // Scan and pay
  'Allow camera access': 'Kamera erişimine izin ver',
  "QR is the universal payment path on iOS and Android.": 'QR, iOS ve Android’de ortak ödeme yoludur.',
  "Scan this device's request": 'Bu cihazın isteğini okut',
  "You can also hold this phone against the merchant's":
    'Telefonu satıcınınkine de yaklaştırabilirsiniz',
  'YOU ARE PAYING': 'ÖDEYECEĞİNİZ',
  'SECURE CHECKOUT': 'GÜVENLİ ÖDEME',
  Recipient: 'Alıcı',
  Asset: 'Varlık',
  Issuer: 'İhraççı',
  Network: 'Ağ',
  Expires: 'Son geçerlilik',
  'Long-press the recipient or issuer to copy it.':
    'Kopyalamak için alıcıya veya ihraççıya uzun basın.',
  'The merchant signature failed verification. Ask for a new payment request.':
    'Satıcı imzası doğrulanamadı. Yeni bir ödeme isteği isteyin.',

  // Receipt
  'PAYMENT COMPLETE': 'ÖDEME TAMAMLANDI',
  Status: 'Durum',
  CONFIRMED: 'ONAYLANDI',
  Ledger: 'Defter',
  Transaction: 'İşlem',
  'Intent ID': 'İstek kimliği',
  'Confirmed at': 'Onay zamanı',
  'View on Explorer': 'Explorer’da görüntüle',
  'Share receipt': 'Makbuzu paylaş',

  // Activity
  Activity: 'Hareketler',
  'Filter activity': 'Hareketleri filtrele',
  PAYMENTS: 'ÖDEMELER',

  // Merchant
  'GET PAID': 'ÖDEME AL',
  'Set up your business': 'İşletmenizi kurun',
  'Customers see this name. You are paid into the wallet you already have.':
    'Müşteriler bu adı görür. Ödeme, hâlihazırdaki cüzdanınıza yapılır.',
  'BUSINESS NAME': 'İŞLETME ADI',
  'RECEIVING ADDRESS': 'ALICI ADRES',
  'Paid into this wallet': 'Bu cüzdana ödenir',
  'Stellar account or contract address that receives payments':
    'Ödemeleri alan Stellar hesabı veya kontrat adresi',
  'The address is checked before it can ever appear on a payment request.':
    'Adres, bir ödeme isteğinde görünmeden önce doğrulanır.',
  'Verify and continue': 'Doğrula ve devam et',
  'Registering on Testnet': 'Testnet’e kaydediliyor',
  'Payment request': 'Ödeme isteği',
  'Enter what the customer owes': 'Müşterinin borcunu girin',
  'PAID IN': 'ÖDEME BİRİMİ',
  'PRICED IN': 'FİYAT BİRİMİ',
  REFERENCE: 'AÇIKLAMA',
  'Create payment request': 'Ödeme isteği oluştur',
  'New request': 'Yeni istek',
  'Preview customer view': 'Müşteri görünümünü önizle',
  'PAYMENT STATUS': 'ÖDEME DURUMU',
  'Not registered on Testnet': 'Testnet’e kayıtlı değil',
  'Register this business': 'Bu işletmeyi kaydet',
  'The settlement contract only accepts requests from a registered merchant key.':
    'Ödeşme kontratı yalnızca kayıtlı bir satıcı anahtarından gelen istekleri kabul eder.',
  'Or let the customer tap their phone here':
    'Ya da müşteri telefonunu buraya dokundursun',
  'Set up business': 'İşletmeyi kur',
  'Set up your business profile before creating a payment request.':
    'Ödeme isteği oluşturmadan önce işletme profilinizi kurun.',
  'Recent payments': 'Son ödemeler',
  'Create a request and keep this screen open at the counter.':
    'Bir istek oluşturun ve bu ekranı tezgâhta açık tutun.',
  'Business status': 'İşletme durumu',
  SETTLED: 'ÖDEŞTİ',
  OPEN: 'AÇIK',
  'ACTIVE QR': 'AKTİF QR',
  BUSINESS: 'İŞLETME',
  Pay: 'Öde',
  'Get paid': 'Ödeme al',

  // Card and errors
  'Copy wallet address': 'Cüzdan adresini kopyala',
  'SETUP REQUIRED': 'KURULUM GEREKLİ',
  READING: 'OKUNUYOR',
  RECONNECTING: 'YENİDEN BAĞLANIYOR',
  'Lumenade Pay needs a fresh start': 'Lumenade Pay’in yeniden başlaması gerekiyor',
  'Your wallet and payment authorization were not changed.':
    'Cüzdanınız ve ödeme yetkiniz değişmedi.',
  'Try again': 'Tekrar dene',
  'Lira needs a recovery-phrase wallet': 'Lira için kurtarma cümlesi cüzdanı gerekir',
  'PAID OUT TO': 'ŞURAYA ÖDENDİ',
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
