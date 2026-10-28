import { OfficeStatusResult } from '../types';

export function getOfficeStatus(dateInput: Date = new Date()): OfficeStatusResult {
  // Convert or handle Indian Standard Time (IST = UTC + 5:30)
  // Get time in Asia/Kolkata timezone
  const istString = dateInput.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istString);

  const dayOfWeek = istDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Key minute markers:
  // 10:00 AM = 600
  // 01:00 PM = 780
  // 02:00 PM = 840
  // 05:00 PM = 1020

  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesKn = ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'];
  const currentDayName = `${dayNamesEn[dayOfWeek]} (${dayNamesKn[dayOfWeek]})`;

  const timeFormat = istDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const currentTimeString = `${timeFormat} IST`;

  // Sunday = Holiday
  if (dayOfWeek === 0) {
    return {
      isOpen: false,
      isLunchTime: false,
      isSaturdayHalfDay: false,
      isSundayHoliday: true,
      statusText: 'Office Closed (Sunday Holiday)',
      statusTextKn: 'ಕಚೇರಿ ರಜೆ (ಭಾನುವಾರ)',
      scheduleSummary: 'Sunday: Weekly Holiday. Public portals & complaints remain active 24x7 online.',
      currentTimeString,
      currentDayName,
      hoursDetail: 'Opens Monday at 10:00 AM',
    };
  }

  // Saturday = Half Day (10:00 AM - 1:00 PM, closed at 1:00 PM)
  if (dayOfWeek === 6) {
    if (totalMinutes >= 600 && totalMinutes < 780) {
      return {
        isOpen: true,
        isLunchTime: false,
        isSaturdayHalfDay: true,
        isSundayHoliday: false,
        statusText: 'Office Open (Saturday Half-Day)',
        statusTextKn: 'ಕಚೇರಿ ತೆರೆದಿದೆ (ಶನಿವಾರ ಅರ್ಧದಿನ)',
        scheduleSummary: 'Saturday Working Hours: 10:00 AM to 1:00 PM (Half Day)',
        currentTimeString,
        currentDayName,
        hoursDetail: `Open until 1:00 PM today (${Math.floor((780 - totalMinutes) / 60)}h ${(780 - totalMinutes) % 60}m remaining)`,
      };
    } else {
      return {
        isOpen: false,
        isLunchTime: false,
        isSaturdayHalfDay: true,
        isSundayHoliday: false,
        statusText: 'Office Closed (Saturday closed at 1:00 PM)',
        statusTextKn: 'ಕಚೇರಿ ಮುಕ್ತಾಯ (ಶನಿವಾರ ಮಧ್ಯಾಹ್ನ 1:00ಕ್ಕೆ ಮುಕ್ತಾಯ)',
        scheduleSummary: 'Saturday: Half Day was 10:00 AM to 1:00 PM. Closed for the day.',
        currentTimeString,
        currentDayName,
        hoursDetail: 'Opens Monday at 10:00 AM',
      };
    }
  }

  // Monday to Friday (Full Day: 10:00 AM to 5:00 PM, Lunch: 1:00 PM to 2:00 PM)
  if (totalMinutes < 600) {
    return {
      isOpen: false,
      isLunchTime: false,
      isSaturdayHalfDay: false,
      isSundayHoliday: false,
      statusText: 'Office Not Yet Open (Opens at 10:00 AM)',
      statusTextKn: 'ಕಚೇರಿ ಇನ್ನೂ ತೆರೆದಿಲ್ಲ (ಬೆಳಿಗ್ಗೆ 10:00ಕ್ಕೆ ಆರಂಭ)',
      scheduleSummary: 'Full Working Day: 10:00 AM - 5:00 PM (Lunch: 1:00 PM - 2:00 PM)',
      currentTimeString,
      currentDayName,
      hoursDetail: 'Opens today at 10:00 AM',
    };
  }

  // Lunch Break: 1:00 PM to 2:00 PM
  if (totalMinutes >= 780 && totalMinutes < 840) {
    return {
      isOpen: false,
      isLunchTime: true,
      isSaturdayHalfDay: false,
      isSundayHoliday: false,
      statusText: 'Lunch Break (1:00 PM - 2:00 PM)',
      statusTextKn: 'ಮಧ್ಯಾಹ್ನದ ಊಟದ ವಿರಾಮ (1:00 - 2:00)',
      scheduleSummary: 'Office Staff on Lunch Break. Resumes at 2:00 PM.',
      currentTimeString,
      currentDayName,
      hoursDetail: `Staff resumes at 2:00 PM (${840 - totalMinutes} mins left)`,
    };
  }

  // Active working hours: 10:00 - 13:00 or 14:00 - 17:00
  if (totalMinutes >= 600 && totalMinutes < 1020) {
    return {
      isOpen: true,
      isLunchTime: false,
      isSaturdayHalfDay: false,
      isSundayHoliday: false,
      statusText: 'Office Open (In Session)',
      statusTextKn: 'ಕಚೇರಿ ತೆರೆದಿದೆ (ಕಾರ್ಯನಿರ್ವಹಣೆ ಚಾಲ್ತಿಯಲ್ಲಿದೆ)',
      scheduleSummary: 'Full Working Day: 10:00 AM - 5:00 PM',
      currentTimeString,
      currentDayName,
      hoursDetail: `Closes at 5:00 PM today (${Math.floor((1020 - totalMinutes) / 60)}h ${(1020 - totalMinutes) % 60}m remaining)`,
    };
  }

  // After 5:00 PM
  return {
    isOpen: false,
    isLunchTime: false,
    isSaturdayHalfDay: false,
    isSundayHoliday: false,
    statusText: 'Office Closed for the Day (Closed at 5:00 PM)',
    statusTextKn: 'ಇಂದಿನ ಕಚೇರಿ ಮುಕ್ತಾಯ (ಸಂಜೆ 5:00ಕ್ಕೆ ಮುಕ್ತಾಯ)',
    scheduleSummary: 'Working Hours ended at 5:00 PM. Portal accepts complaints 24x7.',
    currentTimeString,
    currentDayName,
    hoursDetail: 'Opens tomorrow at 10:00 AM',
  };
}
