document.addEventListener("DOMContentLoaded", function(){
    displayServerURL();
    displaySubject();
    displayStartOption();
    displayDueOption();
    }, false);

function displayServerURL() {
    chrome.storage.sync.get(['serverurl'], function(items) {
        if ('serverurl' in items) {
            document.getElementById( 'serverurl' ).value = items.serverurl;
        }
    });
}

function displaySubject() {
    chrome.storage.sync.get(['subject'], function(items) {
        if ('subject' in items) {
            document.getElementById( 'subject' ).value = items.subject;
        }
    });
}

function displayStartOption () {
    chrome.storage.sync.get(['startdate'], function(items) {
        if ('startdate' in items) {
            if ( items.startdate === "start_on_day" ) {
                $('#start_day_before').removeClass("option_set");
                $('#start_on_day').addClass("option_set");
            } else {
                $('#start_day_before').addClass("option_set");
                $('#start_on_day').removeClass("option_set");
            }
        } else {
            $('#start_day_before').addClass("option_set");
            $('#start_on_day').removeClass("option_set");
        }
    });
}

function displayDueOption() {
    chrome.storage.sync.get(['duedate'], function(items) {
        if ('duedate' in items) {
            if ( items.duedate === "due_on_day" ) {
                $('#due_day_after').removeClass("option_set");
                $('#due_on_day').addClass("option_set");
            } else {
                $('#due_day_after').addClass("option_set");
                $('#due_on_day').removeClass("option_set");
            }
        } else {
            $('#due_day_after').addClass("option_set");
            $('#due_on_day').removeClass("option_set");
        }
    });
}

start_day_before.onclick = function(element) {
    chrome.storage.sync.set({"startdate":"start_day_before"}, function () {
        displayStartOption();
    });
}

start_on_day.onclick = function(element) {
    chrome.storage.sync.set({"startdate":"start_on_day"}, function () {
        displayStartOption();
    });
}

due_day_after.onclick = function(element) {
    chrome.storage.sync.set({"duedate":"due_day_after"}, function () {
        displayDueOption();
    });
}

due_on_day.onclick = function(element) {
    chrome.storage.sync.set({"duedate":"due_on_day"}, function () {
        displayDueOption();
    });
}

serverurl.onkeyup = function(element) {
    var url=document.getElementById( 'serverurl' ).value;
    console.log( url )
    chrome.storage.sync.set({"serverurl":url}, function () {
    });
};

subject.onkeyup = function(element) {
    var subject=document.getElementById( 'subject' ).value;
    console.log( subject )
    chrome.storage.sync.set({"subject":subject}, function () {
    });
};
