import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRoomClient } from '../../RoomContext';
import classnames from 'classnames';
import { useIntl, FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import { config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settings';

const useStyles = makeStyles((theme) => ({
  setting: {
    padding: theme.spacing(2),
  },
  formControl: {
    display: 'flex',
  },
  switchLabel: {
    justifyContent: 'space-between',
    flex: 'auto',
    display: 'flex',
    padding: theme.spacing(1),
    marginRight: 0,
  },
}));

export const AdvancedSettings: React.FC = React.memo(() => {
  const classes = useStyles();
  const intl = useIntl();
  const roomClient = useRoomClient();
  const settings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const onToggleAdvancedMode = () =>
    dispatch(settingsActions.toggle('advancedMode'));
  const onToggleNotificationSounds = () =>
    dispatch(settingsActions.toggle('notificationSounds'));

  return (
    <React.Fragment>
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.advancedMode}
            onChange={onToggleAdvancedMode}
            value="advancedMode"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.advancedMode',
          defaultMessage: 'Advanced mode',
        })}
      />
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.notificationSounds}
            onChange={onToggleNotificationSounds}
            value="notificationSounds"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.notificationSounds',
          defaultMessage: 'Notification sounds',
        })}
      />
      {!config.lockLastN && (
        <form className={classes.setting} autoComplete="off">
          <FormControl className={classes.formControl}>
            <Select
              value={settings.lastN || ''}
              onChange={(event) => {
                if (event.target.value)
                  roomClient.changeMaxSpotlights(event.target.value);
              }}
              name="Last N"
              autoWidth
            >
              {Array.from(
                { length: config.maxLastN || 10 },
                (_, i) => i + 1
              ).map((lastN) => {
                return (
                  <MenuItem key={lastN} value={lastN}>
                    {lastN}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>
              <FormattedMessage
                id="settings.lastn"
                defaultMessage="Number of visible videos"
              />
            </FormHelperText>
          </FormControl>
        </form>
      )}
    </React.Fragment>
  );
});
AdvancedSettings.displayName = 'AdvancedSettings';
