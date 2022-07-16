import React from 'react';
import { connect } from 'react-redux';
import {
  raisedHandsSelector,
  useAppDispatch,
  useAppSelector,
} from '../../store/selectors';
import PropTypes from 'prop-types';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';
import Chat from './Chat/Chat';
import ParticipantList from './ParticipantList/ParticipantList';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';
import GroupIcon from '@material-ui/icons/Group';

import { ReactComponent as PinIcon } from '../../images/pin-icon-baseline.svg';
import { ReactComponent as UnpinIcon } from '../../images/pin-icon-outline.svg';
import { settingsActions } from '../../store/slices/settings';
import { toolareaActions } from '../../store/slices/toolarea';

const tabs = ['users', 'chat'] as const;

interface Props {
  closeDrawer: () => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    display: 'flex',
    flexDirection: 'row',
  },
  tabsHeader: {
    flexGrow: 1,
  },
}));

export const MeetingDrawer: React.FC<Props> = React.memo((props) => {
  const intl = useIntl();
  const classes = useStyles();
  const theme = useTheme();

  const {
    currentToolTab,
    unreadMessages,
    unreadFiles,
    raisedHands,
    drawerOverlayed,
    browser,
  } = useAppSelector((state) => ({
    currentToolTab: state.toolarea.currentToolTab,
    unreadMessages: state.toolarea.unreadMessages,
    unreadFiles: state.toolarea.unreadFiles,
    raisedHands: raisedHandsSelector(state),
    drawerOverlayed: state.settings.drawerOverlayed,
    browser: state.me.browser,
  }));
  const dispatch = useAppDispatch();

  const { closeDrawer } = props;

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default" className={classes.appBar}>
        <Tabs
          className={classes.tabsHeader}
          value={tabs.indexOf(currentToolTab)}
          onChange={(event, value) =>
            dispatch(toolareaActions.setToolTab(tabs[value]))
          }
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge color="secondary" badgeContent={raisedHands}>
                <GroupIcon />
                &nbsp;
                {browser.platform !== 'mobile' &&
                  intl.formatMessage({
                    id: 'label.participants',
                    defaultMessage: 'Participants',
                  })}
              </Badge>
            }
          />
          <Tab
            label={
              <Badge
                color="secondary"
                badgeContent={unreadMessages + unreadFiles}
              >
                <ChatIcon />
                &nbsp;
                {browser.platform !== 'mobile' &&
                  intl.formatMessage({
                    id: 'label.chat',
                    defaultMessage: 'Chat',
                  })}
              </Badge>
            }
          />
        </Tabs>
        {browser.platform !== 'mobile' && (
          <React.Fragment>
            <IconButton
              onClick={() =>
                dispatch(settingsActions.toggle('drawerOverlayed'))
              }
            >
              {drawerOverlayed ? <UnpinIcon /> : <PinIcon />}
            </IconButton>
            <IconButton onClick={closeDrawer}>
              {theme.direction === 'ltr' ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </React.Fragment>
        )}
      </AppBar>
      {currentToolTab === 'chat' && <Chat />}
      {currentToolTab === 'users' && <ParticipantList />}
    </div>
  );
});
