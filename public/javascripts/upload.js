function upload(file, signed_request, url, done) {
  var xhr = new XMLHttpRequest()
  xhr.open("PUT", signed_request)
  xhr.setRequestHeader('x-amz-acl', 'public-read')
  xhr.onload = function() {
    if (xhr.status === 200) {
      done()
    }
  }

  xhr.send(file)
}

function sign_request(file, done) {
  var xhr = new XMLHttpRequest()
  xhr.open("GET", "/sign?file_name=" + Date.now() + "&file_type=" + file.type)

  xhr.onreadystatechange = function() {
    if(xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText)
      done(response)
    }
  }

  xhr.send()
}

$(document).ready(function() {
  $('#loading').hide()
  $("#snapfile").change(function() {
    var file = $("#snapfile")[0].files[0]
     if (!file) {
       alert("No file selected.")
       return
     }
     $('#minisnap').hide()
     $('#loading').show()
     sign_request(file, function(response) {
       upload(file, response.signed_request, response.url, function() {
         $('#minisnap').attr('src', response.url);
         $('#loading').hide()
         $('#minisnap').show();
         var input = $("<input>").attr("type", "hidden").attr("name", "picture_url").val(response.url);
         $('#submitform').append($(input));
         $('#uploadbutton').prop('disabled', false);
       });
     });
  });
});
