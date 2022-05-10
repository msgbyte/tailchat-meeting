import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as roomActions from '../../store/actions/roomActions';
import { useIntl, FormattedMessage } from 'react-intl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { MediaSettings } from './MediaSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { AdvancedSettings } from './AdvancedSettings';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Close from '@material-ui/icons/Close';
import { useAppDispatch, useAppSelector } from '../../store/selectors';

const tabs = ['media', 'appearance', 'advanced'];

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
  tabsHeader: {
    flexGrow: 1,
  },
}));

export const Settings: React.FC = React.memo(() => {
  const classes = useStyles();
  const intl = useIntl();
  const currentSettingsTab = useAppSelector(
    (state) => state.room.currentSettingsTab
  );
  const settingsOpen = useAppSelector((state) => state.room.settingsOpen);
  const dispatch = useAppDispatch();
  const handleCloseSettings = (settingsOpen) => {
    dispatch(roomActions.setSettingsOpen(settingsOpen));
  };
  const setSettingsTab = (tab) => {
    dispatch(roomActions.setSettingsTab(tab));
  };

  return (
    <Dialog
      className={classes.root}
      open={settingsOpen}
      onClose={() => handleCloseSettings(false)}
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      <DialogTitle id="form-dialog-title">
        <FormattedMessage id="settings.settings" defaultMessage="Settings" />
      </DialogTitle>
      <Tabs
        className={classes.tabsHeader}
        value={tabs.indexOf(currentSettingsTab)}
        onChange={(event, value) => setSettingsTab(tabs[value])}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab
          label={intl.formatMessage({
            id: 'label.media',
            defaultMessage: 'Media',
          })}
        />
        <Tab
          label={intl.formatMessage({
            id: 'label.appearance',
            defaultMessage: 'Appearance',
          })}
        />
        <Tab
          label={intl.formatMessage({
            id: 'label.advanced',
            defaultMessage: 'Advanced',
          })}
        />
      </Tabs>
      {currentSettingsTab === 'media' && <MediaSettings />}
      {currentSettingsTab === 'appearance' && <AppearanceSettings />}
      {currentSettingsTab === 'advanced' && <AdvancedSettings />}
      <DialogActions>
        <Button
          onClick={() => handleCloseSettings(false)}
          color="primary"
          startIcon={<Close />}
        >
          <FormattedMessage id="label.close" defaultMessage="Close" />
        </Button>
      </DialogActions>
    </Dialog>
  );
});
Settings.displayName = 'Settings';
