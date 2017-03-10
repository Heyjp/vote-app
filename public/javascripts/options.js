 $(document).ready(function() {
  var options = 2;

   $('select').material_select();

    $(".button-collapse").sideNav();

   $('#custom-option').on("click", "#add-option", function () {
      $('#custom-option').html('<input type="text" id="new-option" name="customOption" placeholder="Your new choice"><a class="cancel" href="#" id="cancel-option">Cancel Entry</a>');
      $('select').hide();
   });

   $('#custom-option').on("click", '.cancel', function () {
     $('#custom-option').html('<a href="#" id="add-option">Add new category</a>');
     $('select').show();
  });

   $("#create-new-option").unbind().click(function() {
     options++;

     var newDiv = $("<div/>",  {
       class: "no-contain input-field col s12 m12 l12"
     });

     var input = $( "<input/>", {
       type: "text",
       class: "new-poll-choice",
       name: "option" + options,
       placeholder: "Poll Option #" + options,
        class: "new",
        href: "foo.html"
      });


      var label = $('<label/>', {
        for: "option" + options,
        text: "Answer #" + options
      })

      var newAnchor = $('<a/>', {
        class: "clickers",
        href: "#"
      });

      var newIcon = $('<i/>', {
        class: "small material-icons",
        text: "delete"
      });

        $(newAnchor).append(newIcon);
        $(newDiv).append(label);
        $(newDiv).append(input);
        $(newDiv).append(newAnchor);
        $('#extra-options').append(newDiv)
        $(input).focus();


   });

    $('#extra-options').on("click", '.clickers i', function (){
      $(this).closest('.no-contain').remove();
      options--;
    });

    $('.delete-poll').click(function (e) {
        var $theElement = $(this);
        e.preventDefault();
        var pollHref = $(this).attr("href");

        $.ajax({
                url: pollHref,
                type: 'DELETE',
                success: function(message) {
                    // Do something with the result
                    alert(message.message);

                        $theElement.closest("li").fadeOut("normal", function() {
                        $theElement.closest("li").remove();

                        });
                      },
                error: function (err) {
                  alert(err);
                }
              });
            });


    $(".addressClick").click(function () {
            var addressValue = $(this).attr("href");
            alert(addressValue );
        });

 });
