import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import {
  lobbyPeersKeySelector,
  makePermissionSelector,
  useAppDispatch,
  useAppSelector,
} from '../../../store/selectors';
import { permissions } from '../../../permissions';
import * as appPropTypes from '../../appPropTypes';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useRoomClient, withRoomContext } from '../../../RoomContext';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListLobbyPeer from './ListLobbyPeer';
import { roomActions } from '../../../store/slices/room';

const useStyles = makeStyles((theme) => ({
  root: {},
  dialogPaper: {
    width: '30vw',
    [theme.breakpoints.down('lg')]: {
      width: '40vw',
    },
    [theme.breakpoints.down('md')]: {
      width: '50vw',
    },
    [theme.breakpoints.down('sm')]: {
      width: '70vw',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90vw',
    },
  },
  lock: {
    padding: theme.spacing(2),
  },
}));

const hasPermission = makePermissionSelector(permissions.PROMOTE_PEER);

export const LockDialog: React.FC = React.memo(() => {
  const roomClient = useRoomClient();
  const classes = useStyles();
  const { room, lobbyPeers, canPromote } = useAppSelector((state) => ({
    room: state.room,
    lobbyPeers: lobbyPeersKeySelector(state),
    canPromote: hasPermission(state),
  }));
  const dispatch = useAppDispatch();

  const handleCloseLockDialog = useCallback(() => {
    dispatch(roomActions.set('lockDialogOpen', false));
  }, []);

  return (
    <Dialog
      className={classes.root}
      open={room.lockDialogOpen}
      onClose={handleCloseLockDialog}
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      <DialogTitle id="form-dialog-title">
        <FormattedMessage
          id="room.lobbyAdministration"
          defaultMessage="Lobby administration"
        />
      </DialogTitle>
      {lobbyPeers.length > 0 ? (
        <List
          dense
          subheader={
            <ListSubheader component="div">
              <FormattedMessage
                id="room.peersInLobby"
                defaultMessage="Participants in Lobby"
              />
            </ListSubheader>
          }
        >
          {lobbyPeers.map((peerId) => {
            return <ListLobbyPeer key={peerId} id={peerId} />;
          })}
        </List>
      ) : (
        <DialogContent>
          <DialogContentText gutterBottom>
            <FormattedMessage
              id="room.lobbyEmpty"
              defaultMessage="There are currently no one in the lobby"
            />
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button
          disabled={
            lobbyPeers.length === 0 ||
            !canPromote ||
            room.lobbyPeersPromotionInProgress
          }
          onClick={() => roomClient.promoteAllLobbyPeers()}
          color="primary"
        >
          <FormattedMessage
            id="label.promoteAllPeers"
            defaultMessage="Promote all"
          />
        </Button>
        <Button onClick={handleCloseLockDialog} color="primary">
          <FormattedMessage id="label.close" defaultMessage="Close" />
        </Button>
      </DialogActions>
    </Dialog>
  );
});
