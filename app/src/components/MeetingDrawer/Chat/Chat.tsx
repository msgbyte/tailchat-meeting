import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Moderator from './Menu/Moderator';
import List from './List/List';
import Input from './Menu/Input';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
  },
}));

export const Chat: React.FC = React.memo((props) => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Moderator />
      <List />
      <Input />
    </Paper>
  );
});
