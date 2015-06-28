$ ->
  $.get "/pendings/get", (pendingusers) ->
    $.each pendingusers, (index, pendinguser) ->
      $("#pendingusers").append $("<li>").text pendinguser.username+":"+pendinguser.code
