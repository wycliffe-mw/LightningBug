//Add a link to create a task from the planner
//$( ".ff_module-planner-note__actions" ).css( "background", "red" );

function getLessonData(element) {
    // Get the lesson date
    var dataelement = $(element.parent().parent().parent().children()[0]).children()[0];
    var date=dataelement.innerText;

    //find the description
    var classname = $(element).children()[1].innerText;

    //find the time
    var time = $(element).children()[0].innerText;

    // create the lesson
    return createLesson( classname , date , time );
}

function create_lesson_task(event) {
    var lesson = getLessonData($($(event.target).parent().children()[0]));
    console.log( lesson );
    createEditLessonTask(lesson,false);
}


function createRowButton(lessonlink) {
    var lesson = getLessonData(lessonlink);

    // if we already have add a button to edit it
    chrome.storage.sync.get([lesson.key], function (items) {
        var button;
        if (lesson.key in items) {
            button=$('<button type="button" ' +
                'title="Edit lesson task" ' +
                'class="lp_week_planner_button lp_edit_lesson_task">' +
                '<img class="lp_button_image"  src="'+chrome.extension.getURL("images/lightningbug16.png")+'" />' +
                '</button>');
        } else {
            button=$('<button type="button" ' +
                'title="Create lesson task" ' +
                'class="lp_week_planner_button lp_create_lesson_task">' +
                '<img class="lp_button_image" src="'+chrome.extension.getURL("images/lightningbug16.png")+'" />' +
                '</button>');
        }
        button.css( "display" , "inline-block");
        button.mousedown(function(event) {
            event.preventDefault();
            event.stopPropagation();
            switch (event.which) {
                case 1:
                    create_lesson_task(event);
                    break;
                case 2:
                    break;
                case 3:
                    launchTaskPopup(event);
                    break;
                default:
                    alert('You have a strange Mouse!');
            }
        });
        lessonlink.parent().append(button);
    } );
}

function launchTaskPopup(event ) {
    var lesson = getLessonData($($(event.target).parent().children()[0]));
    showTaskPopup(event , lesson );
}



checkServerURL( function() {
    // stop default context menu popping up
    $('body').attr('oncontextmenu','return false;')

    // create the task edit popup
    createTaskPopup();

    //find lesson divs
    var classrefs = $("a[href*='/profile']");
    for (index = 0; index < classrefs.length; ++index) {
        lessonlink = $(classrefs[index]);
        createRowButton(lessonlink);
    }
});
