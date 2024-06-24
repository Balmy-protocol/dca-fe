import {
  atcbIsAndroid,
  atcbDefaultTarget,
  atcbIsMobile,
  atcbIsSafari,
  atcbIsWebView,
  atcbIsiOS,
  atcbIsProblematicWebView,
} from './browsers';

// Most of this file was taken from add-to-calendar-button

export enum LinkType {
  ICal = 'ical',
  Google = 'google',
  MsTeams = 'msteams',
  Ms365 = 'ms365',
  OutlookCom = 'outlookcom',
  Yahoo = 'yahoo',
  Apple = 'apple',
}

type DateInfo = {
  uid?: string;
  timeZone: string;
  name?: string;
  description?: string;
  location?: string;
  recurrence?: string;
  availability?: string;
  descriptionHtmlFree?: string;
  // Assuming start and end times are strings based on usage in generateTime calls
  startDate: string;
  endDate: string;
  descriptionHtmlFreeICal?: string;
};

// FUNCTION TO OPEN THE URL
function openCalUrl(url: string, target = '') {
  const newTarget = target === '' ? atcbDefaultTarget : target;

  const newTab = window.open(url, newTarget);
  if (newTab) {
    newTab.focus();
  }
}

function formatDateTime(datetime: Date, style = 'delimiters', includeTime = true, removeZ = false) {
  const regex = (function () {
    // defines what gets cut off
    if (includeTime) {
      if (style == 'clean') {
        return /(-|:|(\.\d{3}))/g;
      }
      return /(\.\d{3})/g;
    }
    if (style == 'clean') {
      return /(-|T(\d{2}:\d{2}:\d{2}\.\d{3})Z)/g;
    }
    return /T(\d{2}:\d{2}:\d{2}\.\d{3})Z/g;
  })();
  const output = removeZ
    ? datetime.toISOString().replace(regex, '').replace('Z', '')
    : datetime.toISOString().replace(regex, '');
  return output;
}

function generateTime(data: DateInfo, style = 'delimiters', targetCal = 'general') {
  // would be an allday event then
  const startDate = data.startDate.split('-');
  const endDate = data.endDate ? data.endDate.split('-') : startDate;
  // we set 12 o clock as time to prevent Daylight saving time to interfere with any calculation here
  const newStartDate = new Date(
    Date.UTC(Number(startDate[0]), Number(startDate[1]) - 1, Number(startDate[2]), 12, 0, 0)
  );
  const newEndDate = new Date(Date.UTC(Number(endDate[0]), Number(endDate[1]) - 1, Number(endDate[2]), 12, 0, 0));
  // increment the end day by 1 for Google Calendar, iCal, and Microsoft (but only if mobile, since desktop does not need this)
  // TODO: remove Microsoft from this list as soon as they fixed their bugs
  if (
    targetCal === 'google' ||
    (targetCal === 'microsoft' && !atcbIsMobile()) ||
    targetCal === 'msteams' ||
    targetCal === 'ical'
  ) {
    newEndDate.setDate(newEndDate.getDate() + 1);
  }
  // return formatted data
  // for ms teams, we need to remove the Z as well and add the time zone offset +00:00 instead
  // but only on desktop - on mobile devices, we add time information in the user's time zone
  // TODO: optimize this as soon as Microsoft fixed their bugs
  if (targetCal === 'msteams') {
    if (atcbIsMobile()) {
      // get the time zone offset of the user's browser for the start date
      const offset = newStartDate.getTimezoneOffset();
      // get the ISO string of the offset
      const formattedOffset = (function () {
        if (offset < 0) {
          return '+' + ('0' + Math.abs(offset / 60)).slice(-2) + ':' + ('0' + Math.abs(offset % 60)).slice(-2);
        } else {
          return '-' + ('0' + Math.abs(offset / 60)).slice(-2) + ':' + ('0' + Math.abs(offset % 60)).slice(-2);
        }
      })();
      // return formatted data
      return {
        start: formatDateTime(newStartDate, style, false, true) + 'T00:00:00' + formattedOffset,
        end: formatDateTime(newEndDate, style, false, true) + 'T00:00:00' + formattedOffset,
        allday: true,
      };
    }
    return {
      start: formatDateTime(newStartDate, style, false, true) + '+00:00',
      end: formatDateTime(newEndDate, style, false, true) + '+00:00',
      allday: true,
    };
  }
  // for all others, it is easier
  return {
    start: formatDateTime(newStartDate, style, false),
    end: formatDateTime(newEndDate, style, false),
    allday: true,
  };
}
// FUNCTION TO GENERATE THE GOOGLE URL
// See specs at: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md (unofficial)
function generateGoogle(date: DateInfo) {
  const urlParts = [];
  urlParts.push('https://calendar.google.com/calendar/render?action=TEMPLATE');
  // generate and add date
  const formattedDate = generateTime(date, 'clean', 'google');
  urlParts.push('dates=' + encodeURIComponent(formattedDate.start) + '%2F' + encodeURIComponent(formattedDate.end));
  // setting time zone if given and not GMT +/- something, since this is not supported by Google Calendar
  // also do not set for all-day events, since this can lead to Google Calendar trying to adjust times
  if (
    date.timeZone &&
    date.timeZone !== '' &&
    !/(GMT[+|-]\d{1,2}|Etc\/U|Etc\/Zulu|CET|CST6CDT|EET|EST|EST5EDT|MET|MST|MST7MDT|PST8PDT|WET)/i.test(
      date.timeZone
    ) &&
    !formattedDate.allday
  ) {
    urlParts.push('ctz=' + date.timeZone);
  }
  // add details (if set)
  if (date.name && date.name !== '') {
    urlParts.push('text=' + encodeURIComponent(date.name));
  }
  const tmpDataDescription = [];
  if (date.description && date.description !== '') {
    tmpDataDescription.push(date.description);
  }
  if (date.location && date.location !== '') {
    urlParts.push('location=' + encodeURIComponent(date.location));
    // TODO: Find a better solution for the next temporary workaround.
    if (atcbIsiOS()) {
      // workaround to cover a bug, where, when using Google Calendar on an iPhone, the location is not recognized. So, for the moment, we simply add it to the description.
      if (tmpDataDescription.length > 0) {
        tmpDataDescription.push('<br><br>');
      }
      tmpDataDescription.push('&#128205;: ' + date.location);
    }
  }
  if (tmpDataDescription.length > 0) {
    urlParts.push('details=' + encodeURIComponent(tmpDataDescription.join('')));
  }
  if (date.recurrence && date.recurrence !== '') {
    urlParts.push('recur=' + encodeURIComponent(date.recurrence));
  }
  if (date.availability && date.availability !== '') {
    const availabilityPart = (function () {
      if (date.availability == 'free') {
        return 'crm=AVAILABLE&trp=false';
      }
      return 'crm=BUSY&trp=true';
    })();
    urlParts.push(availabilityPart);
  }
  openCalUrl(urlParts.join('&'));
}

// FUNCTION TO GENERATE THE YAHOO URL
// See specs at: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/yahoo.md (unofficial)
function generateYahoo(date: DateInfo) {
  const urlParts = [];
  urlParts.push('https://calendar.yahoo.com/?v=60');
  // generate and add date
  const formattedDate = generateTime(date, 'clean');
  urlParts.push('dur=allday&st=' + encodeURIComponent(formattedDate.start)); // for all-day events, we may only set the start date
  // add details (if set)
  if (date.name && date.name !== '') {
    urlParts.push('title=' + encodeURIComponent(date.name));
  }
  if (date.location && date.location !== '') {
    urlParts.push('in_loc=' + encodeURIComponent(date.location));
  }
  if (date.descriptionHtmlFree && date.descriptionHtmlFree !== '') {
    // using descriptionHtmlFree instead of description, since Yahoo does not support html tags in a stable way
    urlParts.push('desc=' + encodeURIComponent(date.descriptionHtmlFree));
  }
  openCalUrl(urlParts.join('&'));
}

// FUNCTION TO GENERATE THE MICROSOFT 365 OR OUTLOOK WEB URL
// See specs at: TODO: add some documentation here, if it exists
function generateMicrosoft(date: DateInfo, type = 'ms365') {
  const urlParts = [];
  const basePath = (function () {
    // tmp workaround to reflect the fact that Microsoft is routing mobile traffic differently
    // TODO: remove this, when Microsoft has fixed this
    if (atcbIsMobile()) {
      return '/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent';
    }
    return '/calendar/action/compose?rru=addevent';
  })();
  const baseUrl = (function () {
    if (type == 'outlookcom') {
      return 'https://outlook.live.com' + basePath;
    } else {
      return 'https://outlook.office.com' + basePath;
    }
  })();
  urlParts.push(baseUrl);
  // generate and add date
  const formattedDate = generateTime(date, 'delimiters', 'microsoft');
  urlParts.push('startdt=' + formattedDate.start);
  urlParts.push('enddt=' + formattedDate.end);
  if (formattedDate.allday) {
    urlParts.push('allday=true');
  }
  // add details (if set)
  if (date.name && date.name !== '') {
    // for the name, we need to replace any ampersand in the name, as Microsoft does not parse it correctly
    // TODO: remove this, when Microsoft has fixed this
    urlParts.push('subject=' + encodeURIComponent(date.name.replace(/&/g, '&#xFF06;')));
  }
  if (date.location && date.location !== '') {
    urlParts.push('location=' + encodeURIComponent(date.location));
  }
  if (date.description && date.description !== '') {
    urlParts.push('body=' + encodeURIComponent(date.description));
  }
  openCalUrl(urlParts.join('&'));
}

function copyToClipboard(dataString: string) {
  const tmpInput = document.createElement('input');
  document.body.append(tmpInput);
  const editable = tmpInput.contentEditable;
  const readOnly = tmpInput.readOnly;
  tmpInput.contentEditable = 'true';
  tmpInput.readOnly = false;
  tmpInput.value = dataString;
  if (atcbIsiOS()) {
    const range = document.createRange();
    range.selectNodeContents(tmpInput);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    tmpInput.setSelectionRange(0, 999999);
  } else {
    tmpInput.select();
  }
  tmpInput.contentEditable = editable;
  tmpInput.readOnly = readOnly;
  document.execCommand('copy');
  tmpInput.remove();
  // navigator.clipboard.writeText(dataString); would require a lot more hacks on many systems, but could be something for the future (see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
}

function determineIcalFileName() {
  return 'position ends';
}

function copyNote(dataUrl: string) {
  // putting the download url to the clipboard
  copyToClipboard(dataUrl);
}

// FUNCTION TO GENERATE THE MICROSOFT TEAMS URL
// See specs at: https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/build-and-test/deep-link-workflow?tabs=teamsjs-v2#deep-link-to-open-a-meeting-scheduling-dialog
// Mind that this is still in development mode by Microsoft! Location, html tags and linebreaks in the description are not supported yet.
function generateMsTeams(date: DateInfo) {
  const urlParts = [];
  const baseUrl = 'https://teams.microsoft.com/l/meeting/new?';
  // generate and add date
  const formattedDate = generateTime(date, 'delimiters', 'msteams');
  // we need to encode the date, but not for all-day events on desktop to not encode the plus for the offset (somehow strange, but this all consists somehow of workarounds with the Microsoft Teams url scheme)...
  // TODO: optimize this, when Microsoft has fixed it
  if (!formattedDate.allday || atcbIsMobile()) {
    urlParts.push('startTime=' + encodeURIComponent(formattedDate.start));
    urlParts.push('endTime=' + encodeURIComponent(formattedDate.end));
  } else {
    urlParts.push('startTime=' + formattedDate.start);
    urlParts.push('endTime=' + formattedDate.end);
  }
  // add details (if set)
  if (date.name && date.name !== '') {
    urlParts.push('subject=' + encodeURIComponent(date.name));
  }
  let locationString = '';
  if (date.location && date.location !== '') {
    locationString = date.location;
    locationString += ' // '; // preparing the workaround putting the location into the description, since the native field is not supported yet
    urlParts.push('location=' + encodeURIComponent(locationString));
  }
  if (date.descriptionHtmlFree && date.descriptionHtmlFree != '') {
    // using descriptionHtmlFree instead of description, since Teams does not support html tags
    urlParts.push('content=' + locationString + encodeURIComponent(date.descriptionHtmlFree));
  }
  openCalUrl(baseUrl + urlParts.join('&'));
}

function rewriteIcalText(content: string, truncate = true, inQuotes = false) {
  let newContent = content;
  if (inQuotes) {
    newContent = newContent.replace(/"/g, '');
  } else {
    newContent = newContent.replace(/\\/g, '\\\\').replace(/(,|;)/g, '\\$1').replace(/\\\\n/g, '\\n');
  }
  if (truncate) {
    // adjusting for intended line breaks + making sure it does not exceed 75 characters per line
    newContent = newContent.replace(/.{60}/g, '$&' + '\r\n ');
  }
  return newContent;
}

// SHARED FUNCTION TO SAVE A FILE
function saveIcsFile(file: string, filename: string) {
  try {
    const save = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as HTMLAnchorElement;
    save.rel = 'noopener';
    save.href = file;
    // not using default target here, since this needs to happen _self on iOS (abstracted to mobile in general) and _blank at Firefox (abstracted to other setups) due to potential cross-origin restrictions
    if (atcbIsMobile()) {
      save.target = '_self';
    } else {
      save.target = '_blank';
    }
    save.download = filename + '.ics';
    const evt = new MouseEvent('click', {
      view: window,
      button: 0,
      bubbles: true,
      cancelable: false,
    });
    save.dispatchEvent(evt);
    (window.URL || window.webkitURL).revokeObjectURL(save.href);
  } catch (e) {
    console.error(e);
  }
}

// FUNCTION TO GENERATE THE iCAL FILE (also for apple - see above)
// See specs at: https://www.rfc-editor.org/rfc/rfc5545.html
function generateIcal(date: DateInfo) {
  // define the right filename
  const filename = determineIcalFileName();

  const now = new Date();
  const icsLines = ['BEGIN:VCALENDAR', 'VERSION:2.0'];
  icsLines.push('PRODID:-// https://app.balmy.xyz // button v1 //EN');
  icsLines.push('CALSCALE:GREGORIAN');
  // we set CANCEL, whenever the status says so
  // mind that in the multi-date case (where we create 1 ics file), it will always be PUBLISH

  icsLines.push('METHOD:PUBLISH');
  // const usedTimeZones = [];
  const formattedDate = generateTime(date, 'clean', 'ical');
  // get the timezone addon string for dates and include time zone information, if set and if not allday (not necessary in that case)
  const timeAddon = (function () {
    if (formattedDate.allday) {
      return ';VALUE=DATE';
    }
    // if (date.timeZone && date.timeZone !== '') {
    //   const timeZoneBlock = tzlib_get_ical_block(date.timeZone);
    //   if (!usedTimeZones.includes(date.timeZone)) {
    //     icsLines.push(timeZoneBlock[0]);
    //   }
    //   usedTimeZones.push(date.timeZone);
    //   return ';' + timeZoneBlock[1];
    // }
  })();
  icsLines.push('BEGIN:VEVENT');
  icsLines.push('DTSTAMP:' + formatDateTime(now, 'clean', true));
  icsLines.push('DTSTART' + timeAddon + ':' + formattedDate.start);
  icsLines.push('DTEND' + timeAddon + ':' + formattedDate.end);
  icsLines.push('SUMMARY:' + rewriteIcalText(date.name || '', true));
  if (date.descriptionHtmlFreeICal && date.descriptionHtmlFreeICal !== '') {
    icsLines.push('DESCRIPTION:' + rewriteIcalText(date.descriptionHtmlFreeICal, true));
  }
  if (date.description && date.description !== '') {
    icsLines.push(
      'X-ALT-DESC;FMTTYPE=text/html:\r\n <!DOCTYPE HTML PUBLIC ""-//W3C//DTD HTML 3.2//EN"">\r\n <HTML><BODY>\r\n ' +
        rewriteIcalText(date.description, true) +
        '\r\n </BODY></HTML>'
    );
  }
  if (date.location && date.location !== '') {
    icsLines.push('LOCATION:' + rewriteIcalText(date.location, true));
  }
  icsLines.push('END:VEVENT');
  icsLines.push('END:VCALENDAR');
  const dataUrl = (function () {
    // otherwise, we generate it from the array
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsLines.join('\r\n'));
  })();
  // in in-app browser cases (WebView), we offer a copy option, since the on-the-fly client side generation is usually not supported
  // for Android, we are more specific than with iOS and only go for specific apps at the moment
  // for Chrome on iOS we basically do the same
  if (
    (atcbIsiOS() && !atcbIsSafari()) ||
    (atcbIsWebView() && (atcbIsiOS() || (atcbIsAndroid() && atcbIsProblematicWebView())))
  ) {
    copyNote(dataUrl);
    return;
  }
  // save the file dialog in all other cases
  saveIcsFile(dataUrl, filename);
}

function generateCalendarLinks(type: LinkType, data: DateInfo) {
  // we differentiate between the type the user triggered and the type of link it shall activate
  let linkType = type;
  // the apple type would trigger the same as ical, for example
  if (type === LinkType.Apple) {
    linkType = LinkType.ICal;
  }
  switch (linkType) {
    case LinkType.ICal: // also for apple (see above)
      generateIcal(data);
      break;
    case LinkType.Google:
      generateGoogle(data);
      break;
    case LinkType.MsTeams:
      generateMsTeams(data);
      break;
    case LinkType.Ms365:
      generateMicrosoft(data);
      break;
    case LinkType.OutlookCom:
      generateMicrosoft(data, 'outlookcom');
      break;
    case LinkType.Yahoo:
      generateYahoo(data);
      break;
    case LinkType.Apple:
      generateIcal(data);
      break;
  }
}

export { generateCalendarLinks };
