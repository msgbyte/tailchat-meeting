import React, { useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRoomClient } from '../RoomContext';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';
import { useAppDispatch, useAppSelector } from '../store/selectors';
import { roomActions } from '../store/slices/room';

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
  dialogActions: {
    flexDirection: 'row',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },

  logo: {
    marginLeft: theme.spacing(1.5),
    marginRight: 'auto',
  },
  divider: {
    marginBottom: theme.spacing(3),
  },
}));

export const LeaveDialog: React.FC = React.memo(() => {
  const buttonYes = useRef<HTMLButtonElement>();
  const classes = useStyles();
  const roomClient = useRoomClient();
  const { leaveOpen, chatCount } = useAppSelector((state) => ({
    leaveOpen: state.room.leaveOpen,
    chatCount: state.chat.count,
  }));
  const dispatch = useAppDispatch();

  const handleSetLeaveOpenClose = useCallback(() => {
    dispatch(roomActions.set('leaveOpen', false));
  }, []);

  const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
      buttonYes.current.click();
    } else if (event.key === 'Escape' || event.key === 'Esc') {
      handleSetLeaveOpenClose();
    }
  };

  const handleLeave = () => {
    roomClient.close();
  };

  const handleLeaveWithSavingChat = () => {
    roomClient.saveChat();

    setTimeout(() => {
      roomClient.close();
    }, 1000);
  };

  return (
    <Dialog
      onKeyDown={handleEnterKey}
      open={leaveOpen}
      onClose={handleSetLeaveOpenClose}
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      <DialogTitle id="form-dialog-title">
        <FormattedMessage
          id="room.leavingTheRoom"
          defaultMessage="Leaving the room"
        />
      </DialogTitle>
      <DialogContent dividers>
        <FormattedMessage
          id="room.leaveConfirmationMessage"
          defaultMessage="Do you want to leave the room?"
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleSetLeaveOpenClose}
          color="primary"
          startIcon={<CancelIcon />}
        >
          <FormattedMessage id="label.no" defaultMessage="No" />
        </Button>
        <Button
          onClick={handleLeave}
          color="primary"
          startIcon={<MeetingRoomIcon />}
          ref={buttonYes}
        >
          <FormattedMessage id="label.yes" defaultMessage="Yes" />
        </Button>
        <Button
          onClick={handleLeaveWithSavingChat}
          color="primary"
          startIcon={<SaveIcon />}
          disabled={chatCount === 0}
        >
          <FormattedMessage
            id="label.leaveWithSavingChat"
            defaultMessage="Yes + save chat ({chatCount})"
            values={{ chatCount: chatCount }}
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
});
LeaveDialog.displayName = 'LeaveDialog';
