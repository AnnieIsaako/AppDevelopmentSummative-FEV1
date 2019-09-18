$.ajax({
    url: './config.json',
    type: 'GET',
    dataType: 'json',
    success:function(keys){
        url = `${keys.SERVER_URL}:${keys.SERVER_PORT}`;
        console.log(url);
        getListingData();
    },
    error: function(){
        console.log('cannot find config.json file, cannot run application');
    }
});



$('#register').click(function() {
  event.preventDefault();
  console.log('button clicked');

  let username = $('#username').val();
  let password = $('#password').val();
  let email = $('#email').val();
  $.ajax({
    url: `${url}/users`,
    type: 'POST',
    data: {
      username: username,
      password: password,
      email: email
    },
    success:function(result){
      console.log(result);
    },
    error: function(err) {
      console.log(`${url}/users`);
      console.log(err);
      console.log('something went wrong with registering user');
    }
  });
});

$('#login').click(function() {
  let lUsername = $('#lUsername').val();
  let lPassword = $('#lPassword').val();

  console.log(lUsername);
  console.log(lPassword);

  $.ajax({
    url: `${url}/getUser`,
    type: 'POST',
    data: {
      username: username,
      password: password
    },
    success:function(result) {
      sessionStorage.setItem('userID', result['_id']);
      sessionStorage.setItem('userName', result['username']);
      sessionStorage.setItem('userEmail', result['email']);

      console.log(sessionStorage);
    },
    error: function(err) {
      console.log(err);
      console.log('Couldn\'t log you in');
    }
  });
});

// if (sessionStorage['username']) {
//   console.log('You have logged in successfully');
// } else {
//   console.log('Please sign in');
// }

// Annie codes untill here

$('#addListing').click(function() {
  event.preventDefault();
  $('#addlistingForm').removeClass('d-none');
});

getListingData = () => {
  $.ajax({
    url: `${url}/allListings`,
    type: 'GET',
    success:function(result){
      console.log(result);
      $('#listingDisplay').empty();
      for (var i = 0; i < result.length; i++) {
        $('#listingDisplay').append(`
          <div id="listingCard" class="col-md-4">
            <div class="card mb-4 shadow-sm">
              <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>Placeholder</title><rect width="100%" height="100%" fill="#55595c"/></svg>
              <div class="card-body">
                <h5 class="card-title">${result[i].itemName}</h5>
                <p class="card-text">${result[i].itemDescription}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
                  </div>
                  <small class="text-muted">${result[i].itemPrice}</small>
                </div>
              </div>
            </div>
          </div>
        `);
      }
  },
    error: function(err){
      console.log(err);
      console.log('something went wrong with getting all the products');
    }
  })
}

$('#subitNewListing').click(function(){
  let itemName = $('#itemName').val();
  let itemPrice = $('#itemPrice').val();
  let itemDescription = $('#itemDescription').val();

  let newListing = itemName + ' $' + itemPrice + ' ' + itemDescription;
  console.log(newListing);

  $.ajax({
    url: `${url}/listing`,
    type: 'POST',
    data: {
      itemName: itemName,
      itemPrice: itemPrice,
      itemDescription: itemDescription
    },
    success:function(result){
      console.log(result);
      $('#itemName').val(null);
      $('#itemPrice').val(null);
      $('#itemDescription').val(null);
      $('#itemSeller').val(null);
    },
    error: function(error){
      console.log(error);
      console.log('something went wrong with sending the data');
    }
  })
});

// Larissa codes untill here

// Katherine codes under here
$('#submitForm').click(function(){
  event.preventDefault();

  let commentArea = $('#comments').val();

  $.ajax({
    url: `${url}/sendComments`,
    type: 'POST',
    data: {
      commentDescription: commentArea
    },
    success:function(result){
      console.log(result);
      $('#commentsDisplay').append(`
        <div id="commentsCard" class="col-md-4">
          <div class="card mb-4 shadow-sm">
            <div class="card-body">
              <p class="card-text">${result.commentDescription}</p>
              </div>
          </div>
        </div>
      `);
    },
    error: function(error){
      console.log(error);
      console.log('something went wrong with sending the data');
    }
  })
});

// Edit button to fill the form with exisiting product
$('#commentsDisplay').on('click', '.editBtn', function() {
    event.preventDefault();

    // const id = $(this).parent().parent().data('id');

    $.ajax({
        url: `${url}/allComments/${id}`,
        type: 'POST',
        dataType: 'json',
        success:function(comment){
          console.log(comment);

            editing = true;
        },
        error:function(err){
            console.log(err);
            console.log('something went wrong with getting the single product');
        }
    })
});
//
// // Remove a product
// $('#productList').on('click', '.removeBtn', function(){
//     event.preventDefault();
//
//     if(!sessionStorage['userID']){
//       alert('401, permission denied');
//       return;
//     }
//
//     const id = $(this).parent().parent().data('id');
//     const li = $(this).parent().parent();
//     $.ajax({
//       url: `${url}/product/${id}`,
//       type: 'DELETE',
//       success:function(result){
//         li.remove();
//       },
//       error:function(err) {
//         console.log(err);
//         console.log('something went wrong deleting the product');
//       }
//     })
// });
