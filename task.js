var g_lesson={};

checkServerURL(function () {
    taskPage();
});

function onDiscardButton(event) {
    if( window.location.search.includes("new=true") ) {
        removeLessonLink(event.data.lesson);
    }
}

// Get the data from the planner page
function taskPage() {
    chrome.storage.sync.get(['new_task_lesson'], function (items) {
        if ('new_task_lesson' in items) {
            var lesson = items["new_task_lesson"];
            lesson.start = new Date(lesson.startstr);
            lesson.end = new Date(lesson.endstr);
            console.log(lesson);

            //check that this task exists
            var deleted = false;
            console.log(document.title)
            if (document.title.includes("TaskNotFoundException")) {
                deleted = true;
            } else {
                var messages = $(".ff_module-form-completed__message");
                for (index = 0; index < messages.length; ++index) {
                    var message = messages[index];
                    console.log(message.innerText)
                    if (message.innerText === "This task has been deleted") {
                        deleted = true;
                    }
                }
            }

            if (!deleted) {

                // delete this temp data
                chrome.storage.sync.remove(['new_task_lesson']);

                //add button behaviour
                var waitForDeleteButton = setInterval(function(){
                    if( $( ".ReactModalPortal" ).length ){
                        $( ".ReactModalPortal" ).find( "button[data-testid='discard']").click(  { "lesson" : lesson } ,onDiscardButton );
                        clearInterval(waitForDeleteButton) ;
                    }
                }, 500);

                //fill in the data we have from the planner
                prime_data_fields(lesson);
            } else {
                //delete the task
                removeLessonLink(lesson);
                window.close();
            }
        }
    });
}



function simulateInputStringEntry(string,element) {
    element.focus();
    element.val("");
    document.execCommand('insertText', true, string );
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

function prime_data_fields( lesson ) {
    console.log( lesson );

    chrome.storage.sync.get(['subject','startdate','duedate'], function (items) {
        displayOverlay();

        // Create a new MutationObserver object for the classlist
        g_lesson = lesson;
        var classlist = $(".ff_module-recipient-button-list")[0];
        var observer = new MutationObserver(classlist_changed);
        observer.observe(classlist, {attributes: false, childList: true, attributeOldValue: false});

        //only set the task title if it is empty
        if (isEmptyOrSpaces($("#task\\.title").val())) {
            //set the task title
            var title = lesson.title;
            if ('subject' in items && items.subject !== "" ) { title = items.subject + " - " +title; }
            simulateInputStringEntry( title, $("#task\\.title"));
        }

        //only set the task date of the durdate is empty
        if (isEmptyOrSpaces($("#ff_addtask_date_due").val())) {
            //set the task start date
            var startdate = lesson.start;
            if ( ! 'startdate' in items || items.startdate === "start_day_before") {
                startdate.setDate(startdate.getDate() - 1);
            }
            $("#task\\.startDat").val(startdate.toString());
            var startDateString = dateString(startdate);
            var dateinput = $("#ff_addtask_date_start");
            dateinput.prop('readonly', false);
            simulateInputStringEntry(startDateString, dateinput)
            dateinput.prop('readonly', true);

            //set the task end date
            var enddate = lesson.end;
            if ( ! 'duedate' in items || items.duedate === "due_day_after") {
                enddate.setDate(enddate.getDate() + 1);
            }
            $("#task\\.dueDat").val(enddate.toString());
            var endDateString = dateString(enddate);
            dateinput = $("#ff_addtask_date_due");
            dateinput.prop('readonly', false);
            simulateInputStringEntry(endDateString, dateinput)
            dateinput.prop('readonly', true);
        }

        selectLessonClass(lesson);
    } );
}

function selectLessonClass(lesson) {
    var list=$(".ff_module-recipient-button-list__list")
    if( list ) {
        var selector = "span:contains('"+g_lesson.classname+"')"
        var classspan=$(list).find(selector)[0]
        if( classspan ) {
            $(classspan).closest(".ff_module-profile-picture-and-name-button").click();
            hideOverlay();
        }
    }
}

// handle changes in the classlist -
function classlist_changed(mutations) {
    for( var index=0 ; index < mutations.length ; index ++ ) {
        if( mutations[index].addedNodes.length > 0 ) {
            selectLessonClass(g_lesson);
            
        }
    }
}
