import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRoomClient } from '../../RoomContext';
import {
  highestRoleLevelSelector,
  makePermissionSelector,
  useAppDispatch,
  useAppSelector,
} from '../../store/selectors';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { roomActions } from '../../store/slices/room';
import { PermissionList } from 'tailchat-meeting-sdk';

const canModifyRolesSelector = makePermissionSelector(
  PermissionList.MODIFY_ROLE
);

const useStyles = makeStyles((theme) => ({
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
  setting: {
    padding: theme.spacing(2),
  },
  formControl: {
    display: 'flex',
  },
  divider: {
    marginLeft: theme.spacing(2),
  },
  green: {
    backgroundColor: 'rgba(0, 153, 0, 1)',
  },
}));

export const RolesManager: React.FC = React.memo(() => {
  const roomClient = useRoomClient();
  const { peer, userRoles, canModifyRoles, highestLevel, rolesManagerOpen } =
    useAppSelector((state) => ({
      peer: state.peers[state.room.rolesManagerPeer],
      userRoles: state.room.userRoles,
      canModifyRoles: canModifyRolesSelector(state),
      highestLevel: highestRoleLevelSelector(state),
      rolesManagerOpen: state.room.rolesManagerOpen,
    }));
  const dispatch = useAppDispatch();

  const classes = useStyles();

  const handleCloseRolesManager = useCallback(() => {
    dispatch(roomActions.set('rolesManagerOpen', false));
  }, []);

  return (
    <Dialog
      open={rolesManagerOpen}
      onClose={handleCloseRolesManager}
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      {peer && (
        <React.Fragment>
          <DialogTitle id="form-dialog-title">{peer.displayName}</DialogTitle>
          <DialogContent>
            <DialogContentText gutterBottom>
              <FormattedMessage
                id="moderator.modifyPeerRoles"
                defaultMessage="Change roles"
              />
            </DialogContentText>
          </DialogContent>
          <List>
            {[...userRoles].map((entry) => {
              const role = entry[1];

              if (role.promotable && role.level <= highestLevel) {
                return (
                  <ListItem
                    key={role.id}
                    disabled={
                      role.level > highestLevel ||
                      !canModifyRoles ||
                      peer.peerModifyRolesInProgress
                    }
                  >
                    <ListItemText
                      primary={role.label}
                      // secondary={role.level}
                    />
                    <Button
                      aria-label="Give role"
                      disabled={Boolean(
                        peer.roles.some((peerRole) => peerRole === role.id)
                      )}
                      variant="contained"
                      className={classes.green}
                      onClick={() => {
                        roomClient.givePeerRole(peer.id, role.id);
                      }}
                    >
                      Give role
                    </Button>
                    <div className={classes.divider} />
                    <Button
                      aria-label="Remove role"
                      disabled={
                        !peer.roles.some((peerRole) => peerRole === role.id)
                      }
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        roomClient.removePeerRole(peer.id, role.id);
                      }}
                    >
                      Remove role
                    </Button>
                  </ListItem>
                );
              } else return null;
            })}
          </List>
        </React.Fragment>
      )}

      <DialogActions>
        <Button onClick={handleCloseRolesManager} color="primary">
          <FormattedMessage id="label.close" defaultMessage="Close" />
        </Button>
      </DialogActions>
    </Dialog>
  );
});
