// By: Sabba Petri

(function () {

  var EVENTS_DATA = [];

  var EVENT_TEMPLATE = [
    '<div class="event">',
      '<div class="event-bar"></div>',
      '<div class="event-meta">',
        '<span class="event-title">Sample Item {0}</span>',
        '<span class="event-location">Sample Location</span>',
      '</div>',
    '</div>'].join('');

  // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  // Modified: Sort event by event_start
  Array.prototype.arraySort = function () {
    this.sort(function (a, b) {
      if (a.event_start > b.event_start) {
        return 1;
      } else if (a.event_start < b.event_start) {
        return -1;
      } else {
        return 0;
      }
    });
  };

  // Reference: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match;
    });
  };

  // Pushes to EVENT_DATA and sets event properties
  var setupDataStructure = function (events) {
    EVENTS_DATA = [];
    var eventStart, eventEnd, i;
    for (i = 0; i < events.length; i += 1) {
      eventStart = events[i].start;
      eventEnd = events[i].end;
      if (eventStart != null && eventEnd != null && eventEnd <= 720 && eventStart >= 0 && eventStart < eventEnd) {
        EVENTS_DATA.push({
          event_index: i + 1,          
          event_start: events[i].start,
          event_end: events[i].end,
          event_col_id: -1
        });
      }
    }
  };

  // Sorts EVENT_DATA and assigns event properties 
  var prepareEventData = function () {
    var eventData, i;
    EVENTS_DATA.arraySort();
    for (i = 0; i < EVENTS_DATA.length; i += 1) {
      eventData = EVENTS_DATA[i];
      eventData.top = eventData.event_start;
      eventData.height = eventData.event_end - eventData.event_start;
    }
  };

  // Overlapping: Create cols/push events, find overlapping events, divide width
  var identifyOverlappingEvents = function () {
    var colId, prevEnd, count, eventWidth, left, i, j;
    var width = 578;
    var sortedEvents = [];
    for (colId = 0; colId < EVENTS_DATA.length; colId++) { 
      prevEnd = -1;
      for (i = 0; i < EVENTS_DATA.length; i++) {
        if (EVENTS_DATA[i].event_col_id == -1 && EVENTS_DATA[i].event_start >= prevEnd) {  
          EVENTS_DATA[i].event_col_id = colId; 
          prevEnd = EVENTS_DATA[i].event_end; 
          sortedEvents.push(EVENTS_DATA[i]);
          count++;
        }
        if (count === EVENTS_DATA.length) { 
          break; 
        }
      }
    }

    // Find overlapping events
    for (i = sortedEvents.length - 1; i >= 0; i--) {
      sortedEvents[i].num_cols = sortedEvents[i].event_col_id + 1; 
      for (j = i + 1; j < sortedEvents.length; j++) {
        if (doEventsOverlap(sortedEvents[i], sortedEvents[j])) {
          sortedEvents[i].num_cols = sortedEvents[j].num_cols; 
        }
      }
    }

    // Divide event width, if overlapping
    for (i = 0; i < EVENTS_DATA.length; i++) {
      eventWidth = width / EVENTS_DATA[i].num_cols;
      left = 85 + eventWidth * EVENTS_DATA[i].event_col_id;
      EVENTS_DATA[i].width = eventWidth + 'px'; 
      EVENTS_DATA[i].left = left + 'px';
    }
  };

  // Overlap
  var doEventsOverlap = function (event1, event2) {
    if (event1.event_start >= event2.event_end ||
        event2.event_start >= event1.event_end) {
      return false;
    } else {
      return true;
    }
  };

  // Prepares HTML / inserts into the DOM
  var passHTML = function () {
     var eventElement, i;
     $('#event-table').empty();
     for (i = 0; i < EVENTS_DATA.length; i += 1) {
      eventElement = $('<div class="event-calendar">').css({
        "left": EVENTS_DATA[i].left,
        "width": EVENTS_DATA[i].width,
        "top": EVENTS_DATA[i].top + 26,
        "height": EVENTS_DATA[i].height + 7
      });
      eventElement.append(EVENT_TEMPLATE.format(EVENTS_DATA[i].event_index));
      eventElement.appendTo('#event-table');
    };
  };

  var layoutEvents = function (events) {
    setupDataStructure(events);
    prepareEventData();
    identifyOverlappingEvents();
    passHTML();
  };

  window.layoutEvents = layoutEvents;

})();

function layOutDay(events) {
  return layoutEvents(events);
};
