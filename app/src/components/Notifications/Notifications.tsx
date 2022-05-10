import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  withSnackbar,
  ProviderContext as SnackbarProviderContext,
} from 'notistack';
import * as notificationActions from '../../store/actions/notificationActions';
import { config } from '../../config';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { FormattedMessage } from 'react-intl';
import Lock from '@material-ui/icons/Lock';
import type { AppState } from '../../store/reducers/rootReducer';

interface NotificationsProps extends SnackbarProviderContext {
  notifications: AppState['notifications'];
  removeNotification: (notificationId: string) => void;
  closeNotification: (notificationId: string) => void;
}
class Notifications extends Component<NotificationsProps> {
  displayed = [];

  storeDisplayed = (id) => {
    this.displayed = [...this.displayed, id];
  };

  shouldComponentUpdate({ notifications: newNotifications = [] }) {
    const { notifications: currentNotifications } = this.props;

    let notExists = false;

    for (let i = 0; i < newNotifications.length; i += 1) {
      if (notExists) continue;

      notExists =
        notExists ||
        !currentNotifications.filter(({ id }) => newNotifications[i].id === id)
          .length ||
        currentNotifications.filter(
          ({ id }) =>
            newNotifications[i].id === id &&
            newNotifications[i].toBeClosed === true
        ).length > 0;
    }

    return notExists;
  }

  componentDidUpdate() {
    const { notifications = [] } = this.props;

    notifications.forEach((notification) => {
      // needed for persistent notifications
      if (notification.toBeClosed) {
        this.props.closeSnackbar(notification.id);

        return;
      }

      // Do nothing if snackbar is already displayed
      if (this.displayed.includes(notification.id)) return;

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
                notification.roomClient.addConsentForRecording('agreed');
                this.props.closeSnackbar(key);
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
                notification.roomClient.addConsentForRecording('denied');
                this.props.closeSnackbar(key);
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

      // Display snackbar using notistack
      this.props.enqueueSnackbar(notification.text, {
        variant: notification.type,
        autoHideDuration: notification.timeout,
        persist: notification.persist,
        peerid: notification.peerid,
        roomClient: notification.roomClient,
        key: notification.id,
        action: notification.persist ? okAction : null,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: config.notificationPosition as any,
        },
      } as any);

      // Keep track of snackbars that we've displayed
      this.storeDisplayed(notification.id);

      // Dispatch action to remove snackbar from redux store
      this.props.removeNotification(notification.id);
    });
  }

  render() {
    return null;
  }
}

(Notifications as any).propTypes = {
  notifications: PropTypes.array.isRequired,
  closeNotification: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired,
  closeSnackbar: PropTypes.func.isRequired,
  removeNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  notifications: state.notifications,
});

const mapDispatchToProps = (dispatch) => ({
  removeNotification: (notificationId) =>
    dispatch(notificationActions.removeNotification({ notificationId })),
  closeNotification: (notificationId) =>
    dispatch(notificationActions.closeNotification({ notificationId })),
});

export default withSnackbar(
  connect(mapStateToProps, mapDispatchToProps, null, {
    areStatesEqual: (next, prev) => {
      return prev.notifications === next.notifications;
    },
  })(Notifications)
);
