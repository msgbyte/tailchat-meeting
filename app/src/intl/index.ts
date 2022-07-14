import { createIntl, IntlShape } from 'react-intl';
import { store } from '../store/store';

export let intl: IntlShape;

/**
 * 更新国际化语言
 */
export function updateGlobalIntl() {
  intl = createIntl({
    locale: store.getState().intl.locale,
    messages: store.getState().intl.messages,
  });
}
