let editMode;
$.ajax({
    url: './config.json',
    type: 'GET',
    dataType: 'json',
    success:function(keys) {
        url = `${keys.SERVER_URL}:${keys.SERVER_PORT}`;
        redirectUrl = `${keys.SERVER_URL}/${keys.FRONT_END_PROJECT_NAME}`;
        console.log(url);
        getListingData();
    },
    error: function() {
        console.log('Cant connect to server, need the config file');
    }
});

if(sessionStorage.userID) {
    console.log('you are logged in ');
    $('#logBtn').addClass('d-none');
    $('#regoBtn').addClass('d-none');
    $('#logout').removeClass('d-none');
    $('#cardModal').addClass('shadowCard');
} else {
    console.log('please sign in');
    $('#userFeatures').hide();
    $('#login').removeClass('d-none');
    $('#regoBtn').removeClass('d-none');
    $('#cardModal').removeClass('shadow');
}

$('#register').click(function() {
  event.preventDefault();

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
      window.location.replace(`${redirectUrl}/login.html`);
      $('#logBtn').addClass('d-none');
      $('#regoBtn').addClass('d-none');
    },
    error: function(err) {
      console.log('something went wrong with registering user');
    }
  });
});

let seller;

$('#login').click(function() {
  let username = $('#lUsername').val();
  let password = $('#lPassword').val();

  $.ajax({
    url: `${url}/userLogin`,
    type: 'POST',
    data: {
      username: username,
      password: password
    },
    success:function(result) {
      if (result === 'invalid user') {
        console.log('Sorry, we couldn\'t find a user with that username.' );
      } else if (result === 'invalid password') {
        console.log('Incorrect password');
      } else {

        sessionStorage.setItem('userID', result._id);
        sessionStorage.setItem('userName', result.username);

        seller = sessionStorage.userName;

        $('#lUsername').val(null);
        $('#lPassword').val(null);

        window.location.replace(`${redirectUrl}/index.html`);

      }
    },
    error: function(err) {
      console.log(err);
      console.log('Couldn\'t log you in');
    }
  });
});

$('#logout').click(function() {

    if(!sessionStorage.userID) {
        console.log('You don\'t have permission to access. Please sign in.');
        return;
    }
    console.log('logout successful');
    sessionStorage.clear();
    $('#userFeatures').hide();
    $('#logBtn').removeClass('d-none');
    $('#regoBtn').removeClass('d-none');
    $('#logout').addClass('d-none');
});

// Annie codes untill here

let currentCardId;

getListingData = () => {
  $.ajax({
    url: `${url}/allListings`,
    type: 'GET',
    success:function(result) {
      for (var i = 0; i < result.length; i++) {
      let img = result[i].itemImage;
      if (!img) {
        img = 'https://via.placeholder.com/300';
      } else {
        img = `${url}/${img}`;
      }

      $('.listingDisplay').append(`
        <div class="card cardListStyle mb-4 listingCard" id="${result[i]._id}" data-toggle="modal" data-target="#listingModel" data-id="${result[i]._id}">

            <img class="listingsImg" src="${img}" class="card-img-top">
          <div class="card-body d-flex justify-content-between flex-row">
            <div class="col-8 col-sm-8 px-1">
              <h6 class="card-title"> ${result[i].itemName}</h6>
            </div>
            <div class="col-4 col-sm-4 border-left px-1">
              <small class="text-muted pl-2 pricing">$${result[i].itemPrice}</small>
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
  });
};

getCommentData = () => {
  $.ajax({
    url: `${url}/allComments`,
    type: 'GET',
    success:function(commentsResult){
      $('#commentsDisplay').empty();
      for (var i = 0; i < commentsResult.length; i++) {
        if (commentsResult[i].commentID === currentCardId) {
          $('#comments').val(null);
          $('#commentsDisplay').append(`
            <div id="commentsCard" class="col-12">
              <div class="card mb-4 shadow-sm">
                <div class="card-body " id="commentBody">
                  <p class="card-text">${commentsResult[i].commentDescription}</p>
                  </div>
              </div>
            </div>
          `);
        }
      }
    },
    error: function(err){
      console.log(err);
      console.log('something went wrong with getting all the products');
    }
  });
};

$('#cardsAndComment').on('click', '.deleteBtn', function() {
  if(!sessionStorage.userID) {
      console.log('You don\'t have permission to delete this item. Please sign in.');
      return;
  } else {
    event.preventDefault();
    $('#myModal').modal('hide');

    $.ajax({
      url: `${url}/listing/${currentCardId}`,
      type: 'DELETE',
      data: {
          userId: sessionStorage.userID
      },
      success:function(result){
        document.getElementById(currentCardId).remove();

      },
      error:function(err) {
        console.log(err);
        console.log('something went wrong deleting the product');
      }
    });
  }
});

// ************************************************************************
// ************************ Work in progress *****************************
// ************************************************************************

let activeCard = null;

$('#cardsAndComment').on('click', '.editBtn', function() {
  editMode = true;
  if(!sessionStorage.userID) {
      $('.editBtn').hide();
      return;
  } else {
    event.preventDefault();
    $('#myModal').modal('hide');

    $('#addListingModal').modal('show');
    $('#exampleModalLabel').text('Edit listing');
    $('#uploadImage').hide();
    $.ajax({
        url: `${url}/listing/${currentCardId}`,
        type: 'get',
        data: {
            userId: sessionStorage.userID
        },
        dataType: 'json',
        success:function(result){
          $('#itemName').val(result.itemName);
          $('#itemPrice').val(result.itemPrice);
          $('#itemDescription').val(result.itemDescription);

          activeCard = result;
        },
        error:function(err){
        console.log(err);
            console.log('something went wrong with getting the single item');
        }
    });
  }
});

$('#submitNewListing').click(function() {
  let itemName = $('#itemName').val();
  let itemPrice = $('#itemPrice').val();
  let itemDescription = $('#itemDescription').val();
  let fd = new FormData();

  // look at this file, is it supposed to be uploadImage?
  const file = $('#itemImage')[0].files[0];

  fd.append('uploadImage', file);
  fd.append('itemName', itemName);
  fd.append('itemPrice', itemPrice);
  fd.append('itemDescription', itemDescription);

  if (editMode === true) {
    $.ajax({
      url: `${url}/listing/${currentCardId}`,
      type: 'PATCH',
      data: {
        itemName: itemName,
        itemPrice: itemPrice,
        itemDescription: itemDescription
      },
      success:function(result){
        let activeCardID = document.getElementById(currentCardId);

        // Update the modal
        $('#addListingModal').modal('hide');
        $('#resultName').append(`${result.itemName}`);
        $('#listingCardDescription').append(`${result.itemDescription}`);
        $('#resultPrice').append(`$${result.itemPrice}`);

        // Update the DOM card title when the modal closes
        activeCardID.querySelector('.card-title').innerText = itemName;
        activeCardID.querySelector('.pricing').innerText = `$${itemPrice}`;
      },
      error: function(error){
        console.log(error);
        console.log('something went wrong with sending the data');
      }
    });
  } else {
    $.ajax({
      url: `${url}/listing`,
      type: 'POST',
      data: fd,
      processData: false,
      contentType: false,
      success:function(result){
        console.log(result);
        $('#addListingModal').modal('hide');

        $('.listingDisplay').append(`
          <div class="card cardListStyle mb-4 listingCard" id="${result._id}" data-toggle="modal" data-target="#listingModel" data-id="${result._id}">
            <div>
              <img class="listingsImg" src="${url}/${result.itemImage}" class="card-img-top">
            </div>

            <div class="card-body d-flex justify-content-between flex-row">
              <div class="col-8 col-sm-8 px-1">
                <h6 class="card-title"> ${result.itemName}</h6>
              </div>
              <div class="col-4 col-sm-4 border-left px-1">
                <small class="text-muted pl-2">$${result.itemPrice}</small>
              </div>
            </div>
          </div>
        `);

      },
      error: function(error){
        console.log(error);
        console.log('something went wrong with sending the data. Please check that your image is a png or jpeg. Any other file type will not be uploaded.');
      }
    });
  }
});

// ************************************************************************
// ************************ Work ends *************************************
// ************************************************************************

$('#submitComment').click(function(){
  event.preventDefault();

  if(!sessionStorage.userID) {
    $('#comments').val(null);
    $('#myModal').modal('hide');
    $('#invalidModal').modal('show');
  } else {
    let commentIdFromCard = currentCardId;
    let commentArea = $('#comments').val();

    $.ajax({
      url: `${url}/sendComments`,
      type: 'POST',
      data: {
        commentDescription: commentArea,
        commentID:commentIdFromCard
      },
      success:function(result){
        getCommentData();
        $('#commentsDisplay').append(`
          <div id="commentsCard" class="col-md-4">
            <div class="card mb-4 shadow-sm">
              <div class="card-body" id="commentBody">
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
    });
  }
});



$('.listingDisplay').on('click', '.listingCard', function(listingNumber){
  event.preventDefault();

  currentCardId = $(this).data('id');
  console.log(this);

  $.ajax({
    url: `${url}/listing/${currentCardId}`,
    type: 'GET',
    dataType: 'json',
    success:function(result){
      $('#myModal').modal('show');

      $('#listingImage').empty();
      $('#resultName').empty();
      $('#listingCardDescription').empty();
      $('#resultPrice').empty();
      $('#resultSeller').empty();

      $('#listingImage').append(`<img src="${url}/${result.itemImage}" class="card-img-top pt-3" style="width: 100%">`);
      $('#resultName').append(`${result.itemName}`);
      $('#listingCardDescription').append(`${result.itemDescription}`);
      $('#resultPrice').append(`$${result.itemPrice}`);
      $('#resultSeller').append(seller);

      getCommentData();

      if(!sessionStorage.userID) {
          return;
      } else {
        $('#userListingButtons').removeClass('d-none');
      }

    },
    error:function(err){
        console.log('something went wrong with getting the single product');
    }
  });
});

$('#addNewListing').click(function() {
  event.preventDefault();
  editMode = false;
  $('#exampleModalLabel').text('Add listing');
  if(!sessionStorage.userID) {
    $('#invalidModal').modal('show');
  } else {
    $('#addListingModal').modal('show');
    $('#uploadImage').show();
    $('#itemName').val(null);
    $('#itemImage').val(null);
    $('#itemPrice').val(null);
    $('#itemDescription').val(null);
  }
});

$('#itemImage').change(function(e){
  if(e.target.files.length > 0){
    const fileName = e.target.files[0].name;
    $(this).next('.custom-file-label').html(fileName);
  }
});

$("#popularItemsCards" ).owlCarousel({
  loop:true,
  margin:10,
  responsive:{
      0:{
          items:3
      },
      600:{
          items:4
      },
      1000:{
          items:5
      }
  }
});

$(document).ready(function(){
  $(".owl-carousel").owlCarousel();
});

$('#hamburgerNav').click(function(){
  if ($('#navDropDown').hasClass('d-none')) {
    $('#navDropDown').removeClass('d-none');
    $('#navDropDown').slideDown();
    $('#hamburgerNav').empty();
    $('#hamburgerNav').append('<i class="fas fa-times pl-4"></i>');
  } else {
    $('#navDropDown').addClass('d-none');
    $('#hamburgerNav').empty();
    $('#hamburgerNav').append('<i class="fas fa-bars pl-4">');
  }
});

// larissa untill here

$('#submitComment').click(function(){
  event.preventDefault();
  const cardId = $(this).data('id');

  let commentArea = $('#comments').val();

  $.ajax({
    url: `${url}/sendComments`,
    type: 'POST',
    data: {
      commentDescription: commentArea
    },
    success:function(result){
      $('#comments').val(null);
      $('#commentsDisplay').append(`
        <div id="commentsCard" class="col-md-4">
          <div class="card mb-4 shadow-sm">
            <div class="card-body" id="commentBody">
              <p class="card-text">${result.commentDescription}</p>
              </div>
          </div>
        </div>
      `);
    },
    error: function(error){
      console.log('something went wrong with sending the data');
    }
  });
});
