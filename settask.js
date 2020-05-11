function onDeleteLessonButton(event) {
    removeLessonLink(event.data.lesson);
}

function onDeleteTaskButton(event) {
    var str = window.location.pathname;
    var matches = str.match(/(\d+)/);
    if (matches) { removeTaskLink(matches[0]); }
}

// Get the data from the planner page
chrome.storage.sync.get(['new_task_lesson'], function(items) {
    if( 'new_task_lesson' in items ) {
        var lesson = items["new_task_lesson"];

        //check that this task exists
        if (document.title.includes("TaskNotFoundException")) {
            //delete the task from the chrome.sync
            removeLessonLink(lesson);
            window.close();
        }

        // delete this temp data
        chrome.storage.sync.remove(['new_task_lesson']);

        //add button behaviour
        var waitForDeleteButton = setInterval(function(){
            if( $( ".ReactModalPortal" ).length ){

                $( ".ReactModalPortal" ).find( "button[data-testid='delete']").click(  { "task" : lesson } ,onDeleteLessonButton );
                clearInterval(waitForDeleteButton) ;
            }
        }, 500);

        // clear the new_task_lesson
    } else {
        if (document.title.includes("TaskNotFoundException")) {
            window.close();
        }

        //add button behaviour
        var waitForDeleteButton = setInterval(function(){
            if( $( ".ReactModalPortal" ).length ){
                $( ".ReactModalPortal" ).find( "button[data-testid='delete']").click( onDeleteTaskButton );
                clearInterval(waitForDeleteButton) ;
            }
        }, 500);
    }
});

