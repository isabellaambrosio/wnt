// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page

        $("#articles").append(
            `<li class="collection-header">
        <h4> ${data[i].title} </h4>

        </li>
        <li class="collection-item">
        <a><h5>${data[i].link}</h5></a>
        <a class="waves-effect waves-light btn save" data-id="${data[i]._id}"> Save Article</a>
        </li>`);

    }
});

$("#scrape").on("click", function() {
    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/scrape"
        })
        // With that done, add the note information to the page
        .done(function(data) {
            window.location.reload();
            console.log(data);
            // The title of the article
            // For each one
            for (var i = 0; i < data.length; i++) {
                // Display the apropos information on the page
                $("#articles").append(`
                <li class="collection-header">
                <h4> ${data[i].title} </h4>
                </li>
                <li class="collection-item">
                <a><h5>${data[i].link}</h5></a>
                <a class="waves-effect waves-light btn save" data-id="${data[i]._id}"> Save Article</a>
                </li>`);
            }
        });
});




//SAVE ARTICLES
$(document).on("click", "a.save", function() {
    const id = $(this).attr("data-id");


    $.ajax({
            method: "PUT",
            url: "/articles/saved/" + id,
            data: {
                saved: true
            }
        })
        .done(function(data) {
            console.log("on click data" + JSON.stringify(data));
            console.log("IDDDD" + id);

        });

});


//ADD NOTE CLICK HANDLER
$(document).on("click", "#addNote", function() {
    const id = $(this).attr("data-id");


    $.ajax({
            method: "PUT",
            url: "/articles/saved/" + id,
            data: {
                saved: true
            }
        })
        .done(function(data) {
            console.log("on click data" + JSON.stringify(data));
            console.log("IDDDD" + id);
            // The title of the article
            // $(".dinamicTitle").append("<h2>" + data[0].title + "</h2>");
            // An input to enter a new title
            $("#addTitle").html("<input name='title' >");
            // A textarea to add a new note body
            $("#addNote").html("<textarea name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#modalButton").html("<button id='saveNote' type='button' data-id='" + data._id + "'>Save Note</button>");

            // If there's a note in the article
            //TODO
            //CANT GET TO TITLE OR BODY FOR SOME REASON.
            if (data.note) {
                console.log("DATA NOTE: " + JSON.stringify(data.note));
                $("#showNotes").html(`
                    <div>
                    <h6>${data.note}</h6>
                    <p>${data.note}</p>
                    </div>
                    `);
                for (var i = 0; i < data.note.length; i++) {
                    // Place the title of the note in the title input
                    // $("#addTitle").val(data.note.title[i]);
                    // // Place the body of the note in the body textarea
                    // $("#addNote").val(data.note.body[i]);

                }
            }
        });
});

// When you click the savenote button
$(document).on("click", "#saveNote", function() {
    // event.preventDefault();
    // Grab the id associated with the article from the submit button
    const thisId = $(this).attr("data-id");
    console.log("IIIIIIDDDDDDDD " + thisId);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#addTitle").val(),
                // Value taken from note textarea
                body: $("#addNote").val()
            }
        })
        // With that done
        .done(function(data) {
            // Log the response
            console.log("TES2 " + data);
            // Empty the notes section
            //   $("#notes").empty();

        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#addTitle").val("");
    $("#addNote").val("");
});


//SAVED ARTICLES
$(document).on("click", "a.delete", function() {
    const id = $(this).attr("data-id");

    $.ajax({
            method: "DELETE",
            url: "/articles/saved/" + id,
            data: {
                saved: false
            }
        })
        .done(function(data) {
            window.location.reload();

        });
});
