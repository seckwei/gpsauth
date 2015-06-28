$ ->
  $.get "/clients/get", (clients) ->
    $.each clients, (index, client) ->
      $("#clients").append $("<li>").text client.username
