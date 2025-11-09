const minuteHits: number[] = [];
let dayCount = 0;
let dayStart = new Date().toDateString();

export function guardPerMinute(limit = 5) {

  const now = Date.now();


  while (minuteHits.length && now - minuteHits[0] > 60_000) {
    minuteHits.shift();
  }

  
  if (minuteHits.length >= limit) return false;


  minuteHits.push(now);

  return true;
}

export function guardPerDay(limit = 25) {

  const today = new Date().toDateString();

 
  if (today !== dayStart) {

    dayStart = today;

    dayCount = 0;
  }


  if (dayCount >= limit) return false;

  dayCount += 1;

  return true;
}

export function getDailyCount() { 
  return dayCount; 
}
