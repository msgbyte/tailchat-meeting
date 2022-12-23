import React, { useState } from 'react';
import { Icon as Iconify, IconProps } from '@iconify/react';

const placeHolderStyle = { width: '1em', height: '1em' };

export const Icon: React.FC<Omit<IconProps, 'ref'>> = React.memo((props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Iconify
        className="arco-icon"
        {...props}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <span style={placeHolderStyle} />}
    </>
  );
});
Icon.displayName = 'Icon';
