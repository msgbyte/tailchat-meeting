import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as roomActions from '../../store/actions/roomActions';
import * as settingsActions from '../../store/actions/settingsActions';
import classnames from 'classnames';
import { useIntl, FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import { useRoomClient } from '../../RoomContext';
import { config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../store/selectors';
import type { ViewModeType } from '../../store/reducers/room';
import { getList } from '../../intl/locales';

const localesList = getList();

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

export const AppearanceSettings: React.FC = React.memo(() => {
  const classes = useStyles();
  const isMobile = useAppSelector(
    (state) => state.me.browser.platform === 'mobile'
  );
  const room = useAppSelector((state) => state.room);
  const settings = useAppSelector((state) => state.settings);
  const locale = useAppSelector((state) => state.intl.locale);
  const dispatch = useAppDispatch();
  const roomClient = useRoomClient();

  const onTogglePermanentTopBar = () =>
    dispatch(settingsActions.togglePermanentTopBar());
  const onToggleHiddenControls = () =>
    dispatch(settingsActions.toggleHiddenControls());
  const onToggleShowNotifications = () =>
    dispatch(settingsActions.toggleShowNotifications());
  const onToggleButtonControlBar = () =>
    dispatch(settingsActions.toggleButtonControlBar());
  const onToggleDrawerOverlayed = () =>
    dispatch(settingsActions.toggleDrawerOverlayed());
  const onToggleMirrorOwnVideo = () =>
    dispatch(settingsActions.toggleMirrorOwnVideo());
  const onToggleHideNoVideoParticipants = () =>
    dispatch(settingsActions.toggleHideNoVideoParticipants());
  const handleChangeMode = (mode: ViewModeType) =>
    dispatch(roomActions.setDisplayMode(mode));
  const handleChangeAspectRatio = (aspectRatio) =>
    dispatch(settingsActions.setAspectRatio(aspectRatio));

  const intl = useIntl();

  const modes = [
    {
      value: 'auto',
      label: intl.formatMessage({
        id: 'label.auto',
        defaultMessage: 'Auto',
      }),
    },
    {
      value: 'democratic',
      label: intl.formatMessage({
        id: 'label.democratic',
        defaultMessage: 'Democratic view',
      }),
    },
    {
      value: 'filmstrip',
      label: intl.formatMessage({
        id: 'label.filmstrip',
        defaultMessage: 'Filmstrip view',
      }),
    },
  ];

  return (
    <React.Fragment>
      <FormControl className={classes.setting}>
        <Select
          value={locale || ''}
          onChange={(event) => {
            if (event.target.value) roomClient.setLocale(event.target.value);
          }}
          name={intl.formatMessage({
            id: 'settings.language',
            defaultMessage: 'Select language',
          })}
          autoWidth
        >
          {localesList.map((item, index) => {
            return (
              <MenuItem key={index} value={item.locale[0]}>
                {item.name}
              </MenuItem>
            );
          })}
        </Select>
        <FormHelperText>
          <FormattedMessage
            id="settings.language"
            defaultMessage="Select language"
          />
        </FormHelperText>
      </FormControl>

      <FormControl className={classes.setting}>
        <Select
          value={room.mode || 'auto'}
          onChange={(event) => {
            if (event.target.value) handleChangeMode(event.target.value as any);
          }}
          name={intl.formatMessage({
            id: 'settings.layout',
            defaultMessage: 'Room layout',
          })}
          autoWidth
        >
          {modes.map((mode, index) => {
            return (
              <MenuItem key={index} value={mode.value}>
                {mode.label}
              </MenuItem>
            );
          })}
        </Select>
        <FormHelperText>
          <FormattedMessage
            id="settings.selectRoomLayout"
            defaultMessage="Select room layout"
          />
        </FormHelperText>
      </FormControl>

      <FormControl className={classes.setting}>
        <Select
          value={settings.aspectRatio || ''}
          onChange={(event) => {
            if (event.target.value) {
              handleChangeAspectRatio(event.target.value);
              roomClient.updateWebcam({ restart: true });
            }
          }}
          name={intl.formatMessage({
            id: 'settings.aspectRatio',
            defaultMessage: 'Video aspect ratio',
          })}
          autoWidth
        >
          {config.aspectRatios.map((aspectRatio, index) => {
            return (
              <MenuItem key={index} value={aspectRatio.value}>
                {aspectRatio.label}
              </MenuItem>
            );
          })}
        </Select>
        <FormHelperText>
          <FormattedMessage
            id="settings.selectAspectRatio"
            defaultMessage="Select video aspect ratio"
          />
        </FormHelperText>
      </FormControl>
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.mirrorOwnVideo}
            onChange={onToggleMirrorOwnVideo}
            value="mirrorOwnVideo"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.mirrorOwnVideo',
          defaultMessage: 'Mirror view of own video',
        })}
      />
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.hideNoVideoParticipants}
            onChange={() => {
              roomClient.setHideNoVideoParticipants(
                !settings.hideNoVideoParticipants
              );
              onToggleHideNoVideoParticipants();
            }}
            value="hideNoVideoParticipants"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.hideNoVideoParticipants',
          defaultMessage: 'Hide participants with no video',
        })}
      />
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.permanentTopBar}
            onChange={onTogglePermanentTopBar}
            value="permanentTopBar"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.permanentTopBar',
          defaultMessage: 'Permanent top bar',
        })}
      />
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.hiddenControls}
            onChange={onToggleHiddenControls}
            value="hiddenControls"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.hiddenControls',
          defaultMessage: 'Hidden media controls',
        })}
      />
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.buttonControlBar}
            onChange={onToggleButtonControlBar}
            value="buttonControlBar"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.buttonControlBar',
          defaultMessage: 'Separate media controls',
        })}
      />
      {!isMobile && (
        <FormControlLabel
          className={classnames(classes.setting, classes.switchLabel)}
          control={
            <Switch
              checked={settings.drawerOverlayed}
              onChange={onToggleDrawerOverlayed}
              value="drawerOverlayed"
            />
          }
          labelPlacement="start"
          label={intl.formatMessage({
            id: 'settings.drawerOverlayed',
            defaultMessage: 'Side drawer over content',
          })}
        />
      )}
      <FormControlLabel
        className={classnames(classes.setting, classes.switchLabel)}
        control={
          <Switch
            checked={settings.showNotifications}
            onChange={onToggleShowNotifications}
            value="showNotifications"
          />
        }
        labelPlacement="start"
        label={intl.formatMessage({
          id: 'settings.showNotifications',
          defaultMessage: 'Show notifications',
        })}
      />
    </React.Fragment>
  );
});
AppearanceSettings.displayName = 'AppearanceSettings';
