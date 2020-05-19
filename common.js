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

function taskNumberFromURL( url ) {
    var serverurl = document.createElement('a');
    serverurl.href = url;
    var pathname = serverurl.pathname;

    // pretty dumb relies on all the numbers in the path being the task number
    tasknum = pathname.replace( /[^0-9]/g,'');
    return tasknum;
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
                var link = "/set-tasks/"+taskNumberFromURL( items[lesson.key] );
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
                    // wait a bit because FireFly redirect to a new task page and
                    // that sometimes takes a couple of seconds
                    setTimeout(function () {
                        //save the task path
                        var tasknumber = taskNumberFromURL(tab.location.pathname);
                        var lessonlink = {};
                        lessonlink[lesson.key] = tasknumber;
                        chrome.storage.sync.set(lessonlink, function () {
                            if( close_when_finished ) { window.close(); }
                            else { location.reload(); }
                        });
                    }, 2000);
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

function displayOverlay() {
    $("body").append('<div id="overlay">' +
        '<div class="overlaytext">' +
        '<center><img src="'+chrome.extension.getURL("images/lightningbug128.png")+'"></center>' +
        'Creating lesson task ...' +
        '</div></div>')
    $("#overlay").css( "display" , "block");
}

function hideOverlay() {
    $("#overlay").css( "display" , "none");
}

function showTaskPopup(event , lesson ) {
    chrome.storage.sync.get([lesson.key], function (items) {
        if (lesson.key in items) {
            var tasknum = taskNumberFromURL(items[lesson.key]);
            $(".lp_task_number").val(tasknum);
        } else {
            $(".lp_task_number").val("");
        }
        $(".lp_lesson_key").val(lesson.key);
        displayOverlay();
        $(".lp_popup_overlay, .lp_popup_content").addClass("active");
    } );
}

function hideTaskPopup(event) {
    hideOverlay();
    $(".lp_popup_overlay, .lp_popup_content").removeClass("active");
}

function clearLessonTask(event) {
    var key = $(".lp_lesson_key").val();
    chrome.storage.sync.remove(key, function () {
        hideTaskPopup();
        location.reload();
    });
}

function setLessonTask(event) {
    var tasknum = taskNumberFromURL( $(".lp_task_number").val() );
    if( tasknum === "" ) {
        clearLessonTask(event);
    } else {
        var key = $(".lp_lesson_key").val();
        var lessonlink = {};
        lessonlink[key] = tasknum;
        chrome.storage.sync.set(lessonlink, function () {
            hideTaskPopup();
            location.reload();
        });
    }
}

function createTaskPopup() {
    // create edit popup
    popup = $( '<div class="lp_popup_overlay">' +
        '<!--Creates the popup content-->' +
        ' <div class="lp_popup_content">' +
        '    <img class="lp_button_image" src="'+chrome.extension.getURL("images/lightningbug32.png")+'" />' +
        '    <h2>Set Lesson Task</h2>' +
        '    <p>Enter the task number or paste a link to the task in this box.</p>' +
        '    <table style="width: 100%;">' +
        '       <tr><td colspan="5" style="width: 100%;">' +
        '           <input style="width: 100%; box-sizing: border-box;" type="text" class="lp_task_number" value=""/>' +
        '       </td></tr>' +
        '       <tr><td colspan="5">&nbsp;</td></tr>' +
        '       <tr>' +
        '           <td style="width: 30%;">' +
        '               <button  style="width: 100%;" class="lp_popup_cancel">Cancel</button>' +
        '           </td> <td style="width: 5%;"></td>' +
        '           <td style="width: 30%;">' +
        '               <button  style="width: 100%;" class="lp_popup_clear">Clear</button>' +
        '           </td> <td style="width: 5%;"></td>' +
        '           <td style="width: 30%;">' +
        '               <button  style="width: 100%;" class="lp_popup_ok">Ok</button>' +
        '           </td>' +
        '       </tr>' +
        '    </table>' +
        '    <input hidden="text" class="lp_lesson_key" value=""/>' +
        '    <p>Note: The task number is not checked, you should make sure it is the correct task.</p>' +
        '</div>\n' +
        '</div>' ) ;
    $( "body" ).append(popup);
    $(".lp_popup_cancel").bind( "click" , hideTaskPopup );
    $(".lp_popup_ok").bind( "click" , setLessonTask );
    $(".lp_popup_clear").bind( "click" , clearLessonTask );
}