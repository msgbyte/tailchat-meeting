import React, { useEffect, useRef } from 'react';
import {
  spotlightPeersSelector,
  useAppSelector,
  videoBoxesSelector,
} from '../../store/selectors';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { Peer } from '../Containers/Peer';
import Me from '../Containers/Me';
import { useObjectState } from '../../hooks/useObjectState';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { useWatch } from '../../hooks/useWatch';

const PADDING_H = 50;

const FILL_RATE = 0.95;

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  buttonControlBar: {
    paddingLeft: PADDING_H,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
    },
  },
}));

interface DemocraticProps {
  [key: string]: any;
}

export const Democratic: React.FC<DemocraticProps> = React.memo((props) => {
  const classes = useStyles();
  const [peerSize, setPeerSize] = useObjectState({
    width: 0,
    height: 0,
  });
  const containerRef = useRef<HTMLDivElement>();

  const {
    boxes,
    aspectRatio,
    advancedMode,
    spotlightsPeers,
    buttonControlBar,
    hideSelfView,
  } = useAppSelector((state) => ({
    advancedMode: state.settings.advancedMode,
    boxes: videoBoxesSelector(state),
    spotlightsPeers: spotlightPeersSelector(state),
    hideSelfView: state.room.hideSelfView,
    buttonControlBar: state.settings.buttonControlBar,
    toolAreaOpen: state.toolarea.toolAreaOpen,
    aspectRatio: state.settings.aspectRatio,
  }));

  const _updateDimensions = useMemoizedFn(() => {
    if (!containerRef.current) {
      return;
    }

    if (boxes === 0) {
      return;
    }

    const n = boxes;

    const width =
      containerRef.current.clientWidth - (buttonControlBar ? PADDING_H : 0);
    const height = containerRef.current.clientHeight;

    let x, y, space;

    for (let rows = 1; rows <= boxes; rows = rows + 1) {
      x = width / Math.ceil(n / rows);
      y = x / aspectRatio;

      if (height < y * rows) {
        y = height / rows;
        x = aspectRatio * y;

        break;
      }

      space = height - y * rows;

      if (space < y) break;
    }

    if (
      Math.ceil(peerSize.width) !== Math.ceil(FILL_RATE * x) ||
      Math.ceil(peerSize.height) !== Math.ceil(FILL_RATE * y)
    ) {
      setPeerSize({
        width: Math.ceil(FILL_RATE * x),
        height: Math.ceil(FILL_RATE * y),
      });
    }
  });

  const { run } = useDebounceFn(_updateDimensions, {
    wait: 250,
  });
  const runUpdate = useMemoizedFn(run);

  useEffect(() => {
    window.addEventListener('resize', runUpdate);

    const observer = new ResizeObserver(() => runUpdate());
    observer.observe(containerRef.current);

    runUpdate();

    return () => {
      window.removeEventListener('resize', runUpdate);
      observer.unobserve(containerRef.current);
    };
  }, []);

  useWatch([props], () => {
    runUpdate();
  });

  const style = {
    ...peerSize,
  };

  return (
    <div
      className={classnames(
        classes.root,
        buttonControlBar ? classes.buttonControlBar : null
      )}
      ref={containerRef}
    >
      {!hideSelfView && (
        <Me advancedMode={advancedMode} spacing={6} style={style} />
      )}
      {spotlightsPeers.map((peer) => {
        return (
          <Peer
            key={peer}
            advancedMode={advancedMode}
            id={peer}
            spacing={6}
            style={style}
            enableLayersSwitch
          />
        );
      })}
    </div>
  );
});
Democratic.displayName = 'Democratic';
