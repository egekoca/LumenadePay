import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {CurrencyPicker} from '../src/features/home/CurrencyPicker';
import {DISPLAY_CURRENCIES} from '../src/shared/priceSource';

jest.mock('../src/shared/RosaMark', () => ({RosaMark: () => null}));

const active: ReactTestRenderer.ReactTestRenderer[] = [];

afterEach(() => {
  ReactTestRenderer.act(() => {
    active.splice(0).forEach(renderer => renderer.unmount());
  });
});

async function render(props: Partial<React.ComponentProps<typeof CurrencyPicker>> = {}) {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CurrencyPicker
        onClose={jest.fn()}
        onSelect={jest.fn()}
        selected="TRY"
        visible
        {...props}
      />,
    );
  });
  active.push(renderer);
  return renderer;
}

/**
 * Offering a currency nothing prices is how someone picks dollars, sees lira,
 * and concludes the control is broken. That is exactly what happened: the list
 * was the static four while only the anchor's lira had a source behind it.
 */
describe('which currencies a balance can be read in', () => {
  it('offers only what something will quote', async () => {
    const tree = JSON.stringify((await render({available: ['TRY', 'USD']})).toJSON());

    expect(tree).toContain('TRY');
    expect(tree).toContain('USD');
    // No source, so not offered — rather than offered and silently substituted.
    expect(tree).not.toContain('Nigerian naira');
    expect(tree).not.toContain('euro');
  });

  it('offers every currency before the quote servers have answered', async () => {
    // Not knowing yet is not the same as knowing there are none, and an empty
    // sheet answers nothing.
    const tree = JSON.stringify((await render()).toJSON());

    for (const currency of DISPLAY_CURRENCIES) {
      expect(tree).toContain(currency.name);
    }
  });

  it('falls back to the full list rather than showing an empty sheet', async () => {
    const tree = JSON.stringify((await render({available: ['ZZZ']})).toJSON());

    // Nothing matched, which would leave a sheet with no rows in it.
    expect(tree).toContain('Turkish lira');
  });

  it('passes the chosen code back and closes', async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const renderer = await render({available: ['TRY', 'USD'], onSelect, onClose});

    await ReactTestRenderer.act(async () => {
      renderer.root.findByProps({testID: 'currency-picker-option-USD'}).props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith('USD');
    expect(onClose).toHaveBeenCalled();
  });
});
