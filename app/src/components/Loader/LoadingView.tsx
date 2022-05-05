import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    height: '100%',
    width: '100%',
  },
});

export const LoadingView: React.FC = React.memo(() => {
  const classes = useStyles();

  return <div className={classes.root} />;
});
LoadingView.displayName = 'LoadingView';
