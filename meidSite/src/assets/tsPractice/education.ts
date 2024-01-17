import courses from './courses';
import studyGroups from './studyGroups';

type Course = { id: number; courseId: number; title: string; keywords: string[]; eventType: string };
type StudyGroup = { id: number; studyGroupId: number; title: string; keywords: string[]; eventType: string };
type Event = Course | StudyGroup;
type SearchEventsOptions = { query: number | string; eventType: string };

function searchEvents(options: SearchEventsOptions): Event[] {
  let events: Event[] = options.eventType === 'course' ? courses : studyGroups;

  const filteredEvents = events.filter((event) => {
    if (typeof options.query === 'number') {
      return event.id === options.query;
    } else if (typeof options.query === 'string') {
      return event.keywords.includes(options.query);
    }
    return false;
  });

  return filteredEvents;
}

const searchResults = searchEvents({ query: 'art', eventType: 'course' });
console.log(searchResults);

let enrolledEvents: Event[] = [];

function enroll(event: Event) {
  enrolledEvents.push(event);
  enrolledEvents = [...enrolledEvents, event]
}

const courseToEnroll: Course = {
  id: 1,
  courseId: 1,
  title: 'Improvisational Arts Lab',
  keywords: ['improv', 'art', 'performance', 'lab'],
  eventType: 'course',
};

enroll(courseToEnroll);
console.log(enrolledEvents);
const eventToEnroll: Event = searchResults[0];
enroll(eventToEnroll);
console.log('Enrolled Events:');
enrolledEvents.forEach((event, index) => {
  if ('courseId' in event) {
    console.log(`Course #${index + 1}: ${event.title}`);
  } else if ('studyGroupId' in event) {
    console.log(`Study Group #${index + 1}: ${event.title}`);
  }
});