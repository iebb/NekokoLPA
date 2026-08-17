import React, {useState} from 'react';
import {DatePicker} from 'nekokolpa';

/** The canonical use: a month grid with the selected day highlighted. */
export function Default() {
  const [date, setDate] = useState(new Date('2026-08-17T00:00:00'));
  return <DatePicker value={date} onChange={setDate} />;
}

/** An explicit BCP-47 tag changes the weekday labels and week start. */
export function JapaneseLocale() {
  const [date, setDate] = useState(new Date('2026-08-17T00:00:00'));
  return <DatePicker value={date} onChange={setDate} locale="ja-JP" />;
}
