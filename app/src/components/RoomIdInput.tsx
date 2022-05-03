import InputAdornment from '@material-ui/core/InputAdornment';
import { InputBaseComponentProps } from '@material-ui/core/InputBase';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import NumberFormat from 'react-number-format';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import { useIntl } from 'react-intl';

function NumberFormatCustom(props: InputBaseComponentProps) {
  const { inputRef, onChange, defaultValue, ...other } = props;

  return (
    <NumberFormat
      {...other}
      defaultValue={String(defaultValue)}
      format="### ### ###"
      getInputRef={inputRef}
      onValueChange={({ value }, { event }) => {
        if (!event) {
          return;
        }

        onChange({
          target: {
            value,
          },
        } as any);
      }}
      thousandSeparator
      isNumericString
    />
  );
}

/**
 * 会议号输入框
 */
interface RoomIdInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}
export const RoomIdInput: React.FC<RoomIdInputProps> = React.memo((props) => {
  const intl = useIntl();

  return (
    <TextField
      label={intl.formatMessage({
        id: 'label.meetingNum',
        defaultMessage: 'Meeting Num',
      })}
      value={props.value}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
      disabled={props.disabled}
      InputProps={{
        inputComponent: NumberFormatCustom,
        startAdornment: (
          <InputAdornment position="start">
            <MeetingRoomIcon />
          </InputAdornment>
        ),
      }}
      variant="outlined"
      margin="normal"
      fullWidth={true}
    />
  );
});
RoomIdInput.displayName = 'RoomIdInput';
