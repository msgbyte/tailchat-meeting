import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { config } from '../../../config';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../../store/selectors';
import { setVirtualBackgroundUrl } from '../../../store/actions/settingsActions';

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
export const VirtualBackgroundItems: React.FC = React.memo(() => {
  const classes = useStyles();
  const virtualBackgroundUrl = useAppSelector(
    (state) => state.settings.virtualBackgroundUrl
  );
  const dispatch = useAppDispatch();

  return (
    <div className={classes.root}>
      <div
        className={classNames(classes.virtualBgItem, classes.blurItem, {
          [classes.virtualBgItemSelected]: virtualBackgroundUrl === 'blur',
        })}
        onClick={() => dispatch(setVirtualBackgroundUrl('blur'))}
      >
        Blur
      </div>
      {config.virtualBackground.map((url, i) => (
        <div
          key={i}
          className={classNames(classes.virtualBgItem, {
            [classes.virtualBgItemSelected]: virtualBackgroundUrl === url,
          })}
          onClick={() => dispatch(setVirtualBackgroundUrl(url))}
        >
          <img src={url} />
        </div>
      ))}
    </div>
  );
});
VirtualBackgroundItems.displayName = 'VirtualBackgroundItems';
