import React from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const {
  //allowedMaxDays,
  beforeToday,
  //combine,
  afterToday
} = DateRangePicker;

function disableFutureDates(): any {

  if (afterToday != undefined) {
    return afterToday()
  }
  else {
    return undefined
  }
}
function disablePreviousDates(): any {
  if (beforeToday != undefined) {
    return beforeToday()
  }
  else {
    return undefined
  }
}

const disableDateFeature = (disablePreviousDate: boolean | undefined, disableFutureDate: boolean | undefined) => {
  if (disablePreviousDate && !disableFutureDate) {
    return disablePreviousDates()
  } else if (disableFutureDate  && !disablePreviousDate) {
    return disableFutureDates()
  } else {
    return undefined
  }
}

interface Props {
  format: string
  maxDays: number
  value: any
  onChange: (val: any) => void,
  disablePreviousDate?: boolean,
  isDisabled?: boolean,
  customPlaceHolder?: string
  disableFutureDate?: boolean
}

const DefaultDateRangePicker: React.FC<Props> = ({ format, maxDays, value, onChange, disablePreviousDate, isDisabled, customPlaceHolder, disableFutureDate }) => {
  return (
    <DateRangePicker
      format={format}
      disabledDate={disableDateFeature(disablePreviousDate, disableFutureDate)}
      onChange={onChange}
      style={{ width: '100%' }}
      value={value}
      disabled={isDisabled}
      placement="auto"
      placeholder={customPlaceHolder ?? format}
    />
  )
}

export default DefaultDateRangePicker


