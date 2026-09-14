import {DISPLAY_CURRENCIES} from '../../shared/priceSource';
import {OptionSheet} from '../../shared/OptionSheet';
import {useTranslate} from '../../shared/i18n';

/**
 * Choosing the money a balance is read in.
 *
 * The sheet itself is `OptionSheet`, which the merchant's pricing control also
 * uses: the two were the same modal drawn twice, and the merchant's needed to
 * carry assets as well as currencies. This is now only the list — which
 * currencies, and what they are called.
 */
export function CurrencyPicker({
  available,
  onClose,
  onSelect,
  selected,
  visible,
}: {
  /**
   * The currencies something will actually quote right now. Offering one that
   * nothing prices is how a person picks dollars, sees lira, and concludes the
   * control is broken — which is exactly what happened when this list was the
   * static four and only the anchor's lira had a source behind it.
   *
   * Left undefined, or empty, every currency is offered: an empty sheet answers
   * nothing, and not knowing yet is not the same as knowing there are none.
   */
  available?: readonly string[];
  onClose(): void;
  onSelect(code: string): void;
  selected: string;
  visible: boolean;
}) {
  const t = useTranslate();
  const offered =
    available && available.length > 0
      ? DISPLAY_CURRENCIES.filter(currency => available.includes(currency.code))
      : DISPLAY_CURRENCIES;
  return (
    <OptionSheet
      onClose={onClose}
      onSelect={onSelect}
      options={(offered.length > 0 ? offered : DISPLAY_CURRENCIES).map(currency => ({
        value: currency.code,
        label: currency.code,
        detail: currency.name,
        glyph: currency.flag,
      }))}
      selected={selected}
      testIDPrefix="currency-picker"
      title={t('Show balance in')}
      visible={visible}
    />
  );
}
