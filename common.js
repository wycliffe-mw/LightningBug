var months = {    'January' : 0,    'February' : 1,    'March' : 2,    'April' : 3,
    'May' : 4,    'June' : 5,    'July' : 6,    'August' : 7,    'September' : 8,
    'October' : 9,    'November' : 10,    'December' : 11};

function dayOfWeekAsString(dayIndex) {
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex];
}

function monthAsString(index) {
    return ['January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'][index];
}

function dateString(date) {
    var dayStr = (""+(date.getDate())).padStart(2, '0');
    var monthStr = (""+(date.getMonth()+1)).padStart(2, '0');
    return dayStr+"/"+monthStr+"/"+date.getFullYear();
}

function timeString(date) {
    var hourStr = (""+(date.getHours())).padStart(2, '0');
    var minuteStr = (""+(date.getMinutes())).padStart(2, '0');
    return hourStr+":"+minuteStr ;

}

function titleString(date) {
    var dayStr = dayOfWeekAsString(date.getDay());
    var dateStr = (""+(date.getDate())).padStart(2, '0');
    var monthStr = monthAsString(date.getMonth());
    return dayStr+" "+dateStr+" "+monthStr+" - "+timeString(date);
}

function createLesson( classname , date , time ) {
    // parse the date
    var d = new Date();
    var year = d.getFullYear();
    var day = date.match(/\d+/g).map(Number)[0];
    var month = months[date.split(" ")[2]];

    // parse the time
    var times = time.match(/\d+/g).map(Number);

    // create the lesson
    var lesson = Object();
    lesson.start = new Date( year , month , day , times[0] , times[1] , 0 );
    lesson.startstr = lesson.start.toString();
    lesson.end = new Date( year , month , day , times[2] , times[3] , 0 );
    lesson.endstr = lesson.end.toString();
    lesson.classname = classname ;
    lesson.key = lesson.classname+" - "+dateString(lesson.start)+" - "+
                timeString(lesson.start)+"-"+timeString(lesson.end);
    lesson.title = titleString(lesson.start);

    return lesson ;
}

function createEditLessonTask( lesson , close_when_finished ) {
    console.log( lesson );
    // if we already have a task open it now
    chrome.storage.sync.get([lesson.key], function (items) {
        if (lesson.key in items) {
            console.log( "lesson key found");
            chrome.storage.sync.set({
                'new_task_lesson': lesson
            }, function () {
                // open the task for viewing
                var link = items[lesson.key];
                link = link.replace( "/edit" , "");
                link = link.replace( "tasks" , "set-tasks");
                var tab = window.open(link);
                if( close_when_finished ) {
                    tab.onload = function () { window.close(); }
                } else {
                    tab.onload = function () { location.reload(); }
                }
            });
        } else {
            console.log( "lesson key not found");
            // otherwise save the data and create a new task
            chrome.storage.sync.set({
                'new_task_lesson': lesson
            }, function () {
                //create a new task window
                var tab = window.open("/tasks/new");
                tab.onload = function () {
                    //save the task path
                    var lessonlink = {};
                    lessonlink[lesson.key] = tab.location.pathname;
                    chrome.storage.sync.set(lessonlink, function () {
                        if( close_when_finished ) { window.close(); }
                        else { location.reload(); }
                    });
                }
            });
        }
    });
}

function checkServerURL( code ) {
    chrome.storage.sync.get(['serverurl'], function(items) {
        if ('serverurl' in items) {
            var current_protocol = location.protocol;
            var current_host = location.hostname;

            var serverurl = document.createElement('a');
            serverurl.href = items.serverurl;
            var server_protocol = serverurl.protocol;
            var server_host = serverurl.hostname;
            if( current_protocol === server_protocol && server_host === current_host ) { code(); }
        }
    });
}

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

function removeLessonLink(lesson) {
    chrome.storage.sync.remove(lesson.key, function() {
    });
}

