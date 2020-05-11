//Add a link to create a task from the planner
//$( ".ff_module-planner-note__actions" ).css( "background", "red" );

function getLessonData(element) {
    // Get the lesson date
    var date=$(".ff_module-date-stepper__title--date")[0].innerText;

    // Get the row this button was on
    const row = element.closest(".ff_module-planner-grid-day__row");

    //find the description
    const desc = $(row).find(".ff_module-class-meta-day__item--desc")[0];
    var classname = $(desc).find(".ff_module-class-meta-day__link")[0].innerText;

    //find the time
    var time = $(row).find(".ff_module-planner-grid-day__header")[0].innerText;

    // create the lesson
    return createLesson( classname , date , time );
}

function create_lesson_task(event) {
    var lesson = getLessonData(event.target);
    createEditLessonTask(lesson,false);
}


function createRowButton(row) {
    var lesson = getLessonData(row);

    // if we already have add a button to edit it
    chrome.storage.sync.get([lesson.key], function (items) {
        var button;
        if (lesson.key in items) {
            button=$('<button type="button" ' +
                'title="Edit lesson task" ' +
                'class="lp_edit_lesson_task ff_module-button ff_module-button--tertiary" >' +
                '<span class="ff_icon ff_module-button__icon ff_icon-left">' +
                '<img src="'+chrome.extension.getURL("images/lightningbug16.png")+'" />' +
                '</span>' +
                '<span> Edit lesson task</span>' +
                '</button>');
        } else {
            button=$('<button type="button" ' +
                'title="Create lesson task" ' +
                'class="lp_create_lesson_task ff_module-button ff_module-button--tertiary" >' +
                '<span class="ff_icon ff_module-button__icon ff_icon-left">' +
                '<img src="'+chrome.extension.getURL("images/lightningbug16.png")+'" />' +
                '</span>' +
                '<span> Create lesson task</span>' +
                '</button>');
        }
        row.append(button);
        button.css( "display" , "inline-block");
        button.bind('click', create_lesson_task);
    } );
}

checkServerURL(function () {
    // add buttons
    var rows = $(".ff_module-planner-note__actions");
    for (var index = 0; index < rows.length; ++index) {
        var row = $(rows[index]);
        createRowButton(row);
    }

    $(".ff_module-button--tertiary").css("display", "inline-block");
});