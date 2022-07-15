import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { config } from '../../../config';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../../store/selectors';
import { useIntl } from 'react-intl';
import { settingsActions } from '../../../store/slices/settings';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  blurItem: {
    padding: '0 10px',
    backgroundColor: '#a4a4a4',
    boxShadow: 'inset 0 0 12px #000000',
    color: 'white',
  },
  virtualBgItem: {
    width: '107px',
    height: '60px',
    display: 'flex',
    boxSizing: 'border-box',
    marginTop: '8px',
    marginRight: '8px',
    textAlign: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    borderRadius: '6px',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',

    '& > img': {
      width: '100%',
      height: '100%',
    },
  },
  virtualBgItemSelected: {
    border: `2px solid ${theme.overrides.MuiButton.containedPrimary['backgroundColor']}`,
  },
}));

/**
 * 虚拟背景渲染
 */
export const VirtualBackgroundItems: React.FC<{
  onChange: (imageUrl: string) => void;
}> = React.memo((props) => {
  const classes = useStyles();
  const intl = useIntl();
  const virtualBackgroundUrl = useAppSelector(
    (state) => state.settings.virtualBackgroundUrl
  );
  const dispatch = useAppDispatch();

  const handleChangeUrl = useCallback(
    (url: string) => {
      if (virtualBackgroundUrl === url) {
        // 过滤不变量
        return;
      }

      dispatch(settingsActions.set('virtualBackgroundUrl', url));
      props.onChange(url);
    },
    [virtualBackgroundUrl, props.onChange]
  );

  return (
    <div className={classes.root}>
      <div
        className={classNames(classes.virtualBgItem, classes.blurItem, {
          [classes.virtualBgItemSelected]: virtualBackgroundUrl === 'blur',
        })}
        onClick={() => handleChangeUrl('blur')}
      >
        {intl.formatMessage({
          id: 'settings.virtualBg.blur',
          defaultMessage: 'Blur',
        })}
      </div>
      {config.virtualBackground.map((url, i) => (
        <div
          key={i}
          className={classNames(classes.virtualBgItem, {
            [classes.virtualBgItemSelected]: virtualBackgroundUrl === url,
          })}
          onClick={() => handleChangeUrl(url)}
        >
          <img src={url} />
        </div>
      ))}
    </div>
  );
});
VirtualBackgroundItems.displayName = 'VirtualBackgroundItems';
