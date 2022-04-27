import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { config } from '../../../config';
import classNames from 'classnames';

const useStyles = makeStyles({
  virtualBgItem: {
    width: '107px',
    height: '60px',
    boxSizing: 'border-box',
    marginTop: '8px',
    textAlign: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    borderRadius: '6px',
    justifyContent: 'center',
  },
  virtualBgItemSelected: {
    border: '2px solid green',
  },
});

/**
 * 虚拟背景渲染
 */
export const VirtualBackgroundItems: React.FC = React.memo(() => {
  const classes = useStyles();
  const [selectedItem, setSelectedItem] = useState('');

  return (
    <div>
      {config.virtualBackground.map((url, i) => (
        <div
          key={i}
          className={classNames(classes.virtualBgItem, {
            [classes.virtualBgItemSelected]: selectedItem === url,
          })}
          onClick={() => setSelectedItem(url)}
        >
          <img src={url} />
        </div>
      ))}
    </div>
  );
});
VirtualBackgroundItems.displayName = 'VirtualBackgroundItems';
