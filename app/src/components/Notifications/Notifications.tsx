import React, { Fragment, useLayoutEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { config } from '../../config';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { FormattedMessage } from 'react-intl';
import Lock from '@material-ui/icons/Lock';
import { useAppDispatch, useAppSelector } from '../../store/selectors';
import { notificationsActions } from '../../store/slices/notifications';
import { useRoomClient } from '../../RoomContext';

export const Notifications: React.FC = React.memo(() => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const notifications = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const displayedRef = useRef<string[]>([]);
  const roomClient = useRoomClient();

  useLayoutEffect(() => {
    notifications.forEach((notification) => {
      // needed for persistent notifications
      if (notification.toBeClosed) {
        closeSnackbar(notification.id);
        return;
      }

      // Do nothing if snackbar is already displayed
      if (displayedRef.current.includes(notification.id)) {
        return;
      }

      // customized
      const okAction = (key) => (
        <Fragment>
          <ButtonGroup>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<VerifiedUserIcon />}
              onClick={() => {
                roomClient.addConsentForRecording('agreed');
                closeSnackbar(key);
              }}
            >
              <FormattedMessage
                id="room.recordingConsentAccept"
                defaultMessage="I Accept"
              />
            </Button>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              startIcon={<Lock />}
              onClick={() => {
                roomClient.addConsentForRecording('denied');
                closeSnackbar(key);
              }}
            >
              <FormattedMessage
                id="room.recordingConsentDeny"
                defaultMessage="Deny"
              />
            </Button>
          </ButtonGroup>
        </Fragment>
      );

      console.log('notification', notification);

      // Display snackbar using notistack
      enqueueSnackbar(notification.text, {
        variant: notification.type,
        autoHideDuration: notification.timeout,
        persist: notification.persist,
        key: notification.id,
        action: notification.persist ? okAction : null,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: config.notificationPosition,
        },
      });

      // Keep track of snackbars that we've displayed
      displayedRef.current.push(notification.id);

      // Dispatch action to remove snackbar from redux store
      dispatch(notificationsActions.removeNotification(notification.id));
    });
  }, [notifications.length, enqueueSnackbar, closeSnackbar, roomClient]);

  return null;
});
