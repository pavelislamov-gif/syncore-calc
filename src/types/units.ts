export type LengthUnit = 'mm' | 'cm' | 'm' | 'in'
export type SpeedUnit = 'mm_min' | 'm_min' | 'in_min'
export type FeedPerRevUnit = 'mm_rev' | 'in_rev'
export type FeedPerToothUnit = 'mm_tooth' | 'in_tooth'
export type RpmUnit = 'rpm'
export type PowerUnit = 'kW' | 'W'
export type PressureUnit = 'bar'

export type Unit =
  | LengthUnit
  | SpeedUnit
  | FeedPerRevUnit
  | FeedPerToothUnit
  | RpmUnit
  | PowerUnit
  | PressureUnit
