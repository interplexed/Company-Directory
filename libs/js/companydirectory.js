
// JavaScript and jQuery

// ----------------------------------------------------
// GENERAL CODE STRUCTURE

/*
- Globals
- Search
- Refresh
- Filters
- Create
- Get
- Edit
- Delete
- Logging
- Init
*/


// ----------------------------------------------------
// GLOBAL VARIABLES

let personnel;
let person;
let departments;
let department;
let locations;
let location;
let errorMessage;
let filterData;        // For persisting filter results
let searchData;        // For persisting search results


// ----------------------------------------------------
// TABLE TABS: CLICK HANDLERS

// Personnel
$('#personnelBtn').on('click', async function() {
  $("#filterBtn").attr("disabled", false);
  $("#searchInput").attr("disabled", false);
  if (filterData) {
    presentPersonnel(filterData);
  }
  else if (searchData) {
    $("#searchInput").val("");
    personnel = await getPersonnel();
    presentPersonnel(personnel);
  }
  else {
    personnel = await getPersonnel();
    presentPersonnel(personnel);
  }  
});

// Departments
$('#departmentsBtn').on('click', async function() {
  $("#filterBtn").attr("disabled", true);
  $("#searchInput").attr("disabled", true);
  departments = await getDepartments();
  presentDepartments(departments);
});

// Locations
$('#locationsBtn').on('click', async function() {
  $("#filterBtn").attr("disabled", true);
  $("#searchInput").attr("disabled", true);
  locations = await getLocations();
  presentLocations(locations);
});




// ----------------------------------------------------
// UTILITY: INPUT VALIDATOR REMINDER MESSAGE

// Use the html input pattern attribute to validate characters
// Provide information on valid characters
function validate(inputID) {
  const input = document.getElementById(inputID);
  const validityState = input.validity;

  if (validityState.patternMismatch) {
    input.setCustomValidity("Only letters, numbers, space or - , . @ accepted");
  }
  else {
    input.setCustomValidity("");
  }
  input.reportValidity();
}




// ----------------------------------------------------
// SEARCH PERSONNEL: INPUT HANDLER FUNCTION

$("#searchInput").on("input", async function () {

  const searchInputElement = document.getElementById("searchInput");

  // Check and inform if invalid characters have been entered
  validate("searchInput");

  if (!searchInputElement.validity.valid) {
    return; // Early return if invalid character is present
  }  

  // Less than three characters removes the search term
  //if ($("#searchInput").val().length < 3) {
  if ($("#searchInput").val().length < 3 || $("#searchInput").val().length === "") {

    searchData = null;

    // Return to filtered data if possible
    if (filterData) {
      presentPersonnel(filterData);
    }
    else {
      personnel = await getPersonnel();
      presentPersonnel(personnel);
    }
  }
  // Require 3 characters for a search term
  else {
    searchData = await getSearch($("#searchInput").val());
      presentPersonnel(searchData);
  }
});




// ----------------------------------------------------
// SEARCH PERSONNEL: AJAX

async function getSearch(str) {

  return $.ajax({
    url: "../php/search_all.php",
    method: 'POST',
    dataType: 'json',
    data: {txt: str}

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result['status']['description']) {
          result['status']['description'] = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result['status']['description'];
        displayErrorPage('body',errorMessage);
      }
    
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Search All', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
}




// ----------------------------------------------------
// REFRESH: COMBINED CLICK HANDLER

$("#refreshBtn").click(async function () {
  // Personnel
  if ($("#personnelBtn").hasClass("active")) {

    if (searchData) {
      $("#searchInput").val("");
      personnel = await getPersonnel();
      presentPersonnel(personnel);
    }
    else if (filterData) {
      presentPersonnel(filterData);
    }
    else {
      personnel = await getPersonnel();
      presentPersonnel(personnel);
    }

  } else {

    // Department
    if ($("#departmentsBtn").hasClass("active")) {
      departments = await getDepartments();
      presentDepartments(departments);
    
    // Location
    } else {
      locations = await getLocations();
      presentLocations(locations);
    }
  }
});




// ----------------------------------------------------
// PERSONNEL FILTERS: MODAL BUILDER FUNCTION

$("#filterBtn").click( async function () {

  if (!filterData) {

    // Access all departments and set up the departments select
    departments = await getDepartments();
    $.each(departments.data, function() {
      $("#filterPersonnelDepartment").append(
        $("<option>", {value: this.id, text: this.name})
      );
    });

    // Access all locations and set up the locations select
    locations = await getLocations();
    $.each(locations.data, function() {
      $("#filterPersonnelLocation").append(
        $("<option>", {value: this.id, text: this.name})
      );
    });
  }

  $("#filterModal").modal('show');

  // On change event triggers filter action
  $("#filterPersonnelDepartment, #filterPersonnelLocation").on('change', async function() {

    // Make sure only one filter can be selected
    let selectId = $(this).attr('id');
    if (selectId === 'filterPersonnelDepartment') {
      $("#filterPersonnelDepartment option[value='-1']").text('Deselect this filter');
      $("#filterPersonnelLocation option[value='-1']").text('Select to filter');
      $('#filterPersonnelLocation').val('-1');
    } else if (selectId === 'filterPersonnelLocation') {
      $("#filterPersonnelDepartment option[value='-1']").text('Select to filter');
      $("#filterPersonnelLocation option[value='-1']").text('Deselect this filter');
      $('#filterPersonnelDepartment').val('-1');
    }

    // Trigger the form submission when any option is selected
    if ($("#filterPersonnelDepartment").val() !== "-1" || $("#filterPersonnelLocation").val() !== "-1") {
      
      // Turn the filter button to green
      if ($("#filterBtn").hasClass('btn-primary')) {
        $("#filterBtn").removeClass('btn-primary')
        $("#filterBtn").addClass('btn-success')
      }

      $("#filterForm").submit();

    } 
    else {

    // Otherwise the filters are deselected
    if ($("#filterPersonnelDepartment").val() === "-1" && $("#filterPersonnelLocation").val() === "-1") {

      // Turn the filter button back to blue
      if ($("#filterBtn").hasClass('btn-success')) {
        $("#filterBtn").removeClass('btn-success');
        $("#filterBtn").addClass('btn-primary');
      }

      // Set the temp variable back to null
      filterData = null;

      // Reset the informative option's text
      $("#filterPersonnelDepartment option[value='-1']").text('Select to filter');
      $("#filterPersonnelLocation option[value='-1']").text('Select to filter');

      // Refresh the personnel table
      if (searchData) {
        presentPersonnel(searchData);
      }
      else {
        personnel = await getPersonnel();
        presentPersonnel(personnel);
      }
    }
  }

  $("#filterModal").modal('hide');

  });

});




// ----------------------------------------------------
// PERSONNEL FILTERS: MODAL CLEANUP ON CLOSE FUNCTION

$('#filterModal').on('hidden.bs.modal', function () {

  if (!filterData) {
    // Reset the filters
    $("#filterPersonnelDepartment").find('option[value!="-1"]').remove();
    $("#filterPersonnelLocation").find('option[value!="-1"]').remove();
  }
});




// ----------------------------------------------------
// PERSONNEL FILTERS: FORM SUBMIT HANDLER

$("#filterForm").on("submit", async function(e) {

  e.preventDefault();

  if ($("#filterPersonnelDepartment").val() !== "-1") {
    filterData = await get_personnel_by_department($("#filterPersonnelDepartment").val()) 
    presentPersonnel(filterData);
  }
  if ($("#filterPersonnelLocation").val() !== "-1") {
    filterData = await get_personnel_by_location($("#filterPersonnelLocation").val());
    presentPersonnel(filterData);
  }
});




// ----------------------------------------------------
// PERSONNEL FILTER BY DEPARTMENT: AJAX

async function get_personnel_by_department(department) {

  return $.ajax({
    url: "../php/get_personnel_by_department.php",
    method: 'POST',
    dataType: 'json',
    data: {'id': department}

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result['status']['description']) {
          result['status']['description'] = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result['status']['description'];
        displayErrorPage('body',errorMessage);
      }
    
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Get Personnel By Department', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
}




// ----------------------------------------------------
// PERSONNEL FILTER BY LOCATION: AJAX

async function get_personnel_by_location(location) {

  return $.ajax({
    url: "../php/get_personnel_by_location.php",
    method: 'POST',
    dataType: 'json',
    data: {'id': location}

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result['status']['description']) {
          result['status']['description'] = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result['status']['description'];
        displayErrorPage('body',errorMessage);
      }
    
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Get Personnel By Location', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
}




// ----------------------------------------------------
// CREATE: COMBINED MODAL BUILDER FUNCTION

$("#addBtn").click(async function () {
  
  // Personnel
  if ($("#personnelBtn").hasClass("active")) {

    departments = await getDepartments();
      $.each(departments.data, function() {
        $("#createPersonnelDepartment").append(
          $("<option>", {
            value: this.id,
            text: this.name
          })
        );
      });

      $("#createPersonnelModal").modal('show');

    } else {

      // Department
      if ($("#departmentsBtn").hasClass("active")) {
        locations = await getLocations();
        $.each(locations.data, function() {
          $("#createDepartmentLocation").append(
            $("<option>", {
              value: this.id,
              text: this.name
            })
          );
        }); 

        $("#createDepartmentModal").modal('show');

      } else {

        // Location
        $("#createLocationModal").modal('show');

      }
  }
});




// ----------------------------------------------------
// PERSONNEL CREATE: MODAL CLEANUP ON CLOSE FUNCTION

$('#createPersonnelModal').on('hidden.bs.modal', async function () {
  $(this).find('#createPersonnelForm').trigger('reset');
  $("#createPersonnelDepartment").find('option').remove();
  personnel = await getPersonnel();
  presentPersonnel(personnel); 
});





// ----------------------------------------------------
// PERSONNEL CREATE: FORM SUBMIT HANDLER

$("#createPersonnelForm").on("submit", function(e) {

  e.preventDefault();

  $.ajax({
    url: "../php/insert_personnel.php",
    method: 'POST',
    dataType: 'json',
    data: {
      firstName: $("#createPersonnelFirstName").val(),
      lastName: $("#createPersonnelLastName").val(),
      jobTitle: $("#createPersonnelJobTitle").val(),
      email: $("#createPersonnelEmailAddress").val(),
      departmentID: $("#createPersonnelDepartment").val()
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Create Personnel', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

  $('#createPersonnelModal').modal('hide');
});




// ----------------------------------------------------
// DEPARTMENT CREATE: MODAL CLEANUP ON CLOSE FUNCTION

$('#createDepartmentModal').on('hidden.bs.modal', async function () {
  $(this).find('#createDepartmentForm').trigger('reset');
  $("#createDepartmentLocation").find('option').remove();  
  departments = await getDepartments();
  presentDepartments(departments);
});




// ----------------------------------------------------
// DEPARTMENT CREATE: AJAX

$("#createDepartmentForm").on("submit", function(e) {

  e.preventDefault();

  $.ajax({
    url: "../php/insert_department.php",
    method: 'POST',
    dataType: 'json',
    data: {
      name: $("#createDepartmentName").val(),
      locationID: $("#createDepartmentLocation").val()
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Create Department', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

  $('#createDepartmentModal').modal('hide');
});




// ----------------------------------------------------
// LOCATION CREATE: MODAL CLEANUP ON CLOSE FUNCTION

$('#createLocationModal').on('hidden.bs.modal', async function () {
  $(this).find('#createLocationForm').trigger('reset');
  locations = await getLocations();
  presentLocations(locations);
});




// ----------------------------------------------------
// LOCATION CREATE: AJAX

$("#createLocationForm").on("submit", async function(e) {

  e.preventDefault();

  $.ajax({
    url: "../php/insert_location.php",
    method: 'POST',
    dataType: 'json',
    data: {name: $("#createLocationName").val()}

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }
  
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Create Location', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

  $('#createLocationModal').modal('hide');
});




// ----------------------------------------------------
// PERSONNEL GET: AJAX

async function getPersonnel() {

  return $.ajax({
    url: "../php/get_all_personnel.php",
    method: 'POST',
    dataType: 'json'

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result['status']['description']) {
          result['status']['description'] = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result['status']['description'];
        displayErrorPage('body',errorMessage);
      }
    
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Get Personnel', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
}



// ----------------------------------------------------
// DEPARTMENT GET: AJAX

async function getDepartments() {

  return $.ajax({
    url: "../php/get_all_departments.php",
    method: 'POST',
    dataType: 'json',

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result['status']['description']) {
          result['status']['description'] = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result['status']['description'];
        displayErrorPage('body',errorMessage);
      }
    
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Get Departments', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
}



// ----------------------------------------------------
// LOCATION GET: AJAX

async function getLocations() {

  return $.ajax({
    url: "../php/get_all_locations.php",
    method: 'POST',
    dataType: 'json'

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result['status']['description']) {
          result['status']['description'] = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result['status']['description'];
        displayErrorPage('body',errorMessage);
      }
    
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Get Locations', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
}




// ----------------------------------------------------
// PERSONNEL GET: TABLE PRESENTATION

function presentPersonnel(personnel){

// 
// if filterOrSearchData
// then stuckData = filterOrSearchData

// else 
// filterOrSearchData = null;




  $('#personnelTableBody').empty();
  
  // Check if the data returned from ajax is actually in a 'found' key
  if (personnel.data.found) {
    personnel = personnel.data.found
  }
  else if (personnel.data) {
    personnel = personnel.data
  }
  else {
    appErrorLogger('Personnel Table Build Data', 'error', 'Unexpected data structure');
  }

  var frag = document.createDocumentFragment();

  personnel.forEach(function(item, index) {
    
    // Data structure
    var row = document.createElement("tr");
    var name = document.createElement("td");
    name.classList = "align-middle text-nowrap";
    var firstNameText = document.createTextNode(`${item.lastName}, ${item.firstName}`);
    name.append(firstNameText);
    row.append(name);

    var departmentName = document.createElement("td");
    departmentName.classList = "align-middle text-nowrap d-none d-md-table-cell";    
    var departmentNameText = document.createTextNode(item.departmentName);
    departmentName.append(departmentNameText);
    row.append(departmentName);

    var locationName = document.createElement("td");
    locationName.classList = "align-middle text-nowrap d-none d-md-table-cell";
    var locationNameText = document.createTextNode(item.locationName);
    locationName.append(locationNameText);
    row.append(locationName);

    var email = document.createElement("td");
    email.classList = "align-middle text-nowrap d-none d-md-table-cell";
    var emailText = document.createTextNode(item.email);
    email.append(emailText);
    row.append(email);

    // Toolbar buttons
    var toolbar = document.createElement("td");
    toolbar.classList = "text-end text-nowrap";

    var editBtn = document.createElement("button");
    editBtn.classList = "btn btn-primary btn-sm me-1";
    editBtn.setAttribute("data-bs-toggle", "modal");
    editBtn.setAttribute("data-bs-target", "#editPersonnelModal");
    editBtn.setAttribute("data-id", item.id);
    var editIcon = document.createElement("i");
    editIcon.classList = "fa-solid fa-pencil fa-fw";

    var deleteBtn = document.createElement("button");
    deleteBtn.classList = "btn btn-primary btn-sm";
    deleteBtn.setAttribute("data-bs-toggle", "modal");
    deleteBtn.setAttribute("data-bs-target", "#deletePersonnelModal");
    deleteBtn.setAttribute("data-id", item.id);
    var deleteIcon = document.createElement("i");
    deleteIcon.classList = "fa-solid fa-trash fa-fw";

    editBtn.appendChild(editIcon);
    deleteBtn.appendChild(deleteIcon);
    toolbar.appendChild(editBtn);
    toolbar.appendChild(deleteBtn);

    row.append(toolbar);
    frag.append(row);
  });                
           
  $('#personnelTableBody').append(frag);
}




// ----------------------------------------------------
// DEPARTMENT GET: TABLE PRESENTATION

function presentDepartments(departments){
  $('#departmentTableBody').empty();

  var frag = document.createDocumentFragment();
         
  departments.data.forEach(function(item, index) {
    
    // Data structure
    var row = document.createElement("tr");
    var name = document.createElement("td");
    name.classList = "align-middle text-nowrap";
    var nameText = document.createTextNode(item.name);
    name.append(nameText);
    row.append(name);
    
    var locationName = document.createElement("td");
    locationName.classList = "align-middle text-nowrap d-none d-md-table-cell";    
    var locationNameText = document.createTextNode(item.locationName);
    locationName.append(locationNameText);
    row.append(locationName);

    // Toolbar buttons
    var toolbar = document.createElement("td");
    toolbar.classList = "text-end text-nowrap";

    var editBtn = document.createElement("button");
    editBtn.classList = "btn btn-primary btn-sm me-1";
    editBtn.setAttribute("data-bs-toggle", "modal");
    editBtn.setAttribute("data-bs-target", "#editDepartmentModal");
    editBtn.setAttribute("data-id", item.id);
    var editIcon = document.createElement("i");
    editIcon.classList = "fa-solid fa-pencil fa-fw";

    var deleteBtn = document.createElement("button");
    deleteBtn.classList = "btn btn-primary btn-sm";
    deleteBtn.setAttribute("data-bs-toggle", "modal");
    deleteBtn.setAttribute("data-bs-target", "#deleteDepartmentModal");
    deleteBtn.setAttribute("data-id", item.id);
    var deleteIcon = document.createElement("i");
    deleteIcon.classList = "fa-solid fa-trash fa-fw";

    editBtn.appendChild(editIcon);
    deleteBtn.appendChild(deleteIcon);
    toolbar.appendChild(editBtn);
    toolbar.appendChild(deleteBtn);

    row.append(toolbar);
    frag.append(row);
  });                
           
  $('#departmentTableBody').append(frag);
}




// ----------------------------------------------------
// LOCATIONS GET: TABLE PRESENTATION

function presentLocations(locations){
  $('#locationTableBody').empty();

  var frag = document.createDocumentFragment();
         
  locations.data.forEach(function(item, index) {
    
    // Data structure
    var row = document.createElement("tr");
    var name = document.createElement("td");
    name.classList = "align-middle text-nowrap";
    var nameText = document.createTextNode(item.name);
    name.append(nameText);
    row.append(name);

    // Toolbar buttons
    var toolbar = document.createElement("td");
    toolbar.classList = "text-end text-nowrap";

    var editBtn = document.createElement("button");
    editBtn.classList = "btn btn-primary btn-sm me-1";
    editBtn.setAttribute("data-bs-toggle", "modal");
    editBtn.setAttribute("data-bs-target", "#editLocationModal");
    editBtn.setAttribute("data-id", item.id);
    var editIcon = document.createElement("i");
    editIcon.classList = "fa-solid fa-pencil fa-fw";

    var deleteBtn = document.createElement("button");
    deleteBtn.classList = "btn btn-primary btn-sm";
    deleteBtn.setAttribute("data-bs-toggle", "modal");
    deleteBtn.setAttribute("data-bs-target", "#deleteLocationModal");
    deleteBtn.setAttribute("data-id", item.id);
    var deleteIcon = document.createElement("i");
    deleteIcon.classList = "fa-solid fa-trash fa-fw";

    editBtn.appendChild(editIcon);
    deleteBtn.appendChild(deleteIcon);
    toolbar.appendChild(editBtn);
    toolbar.appendChild(deleteBtn);

    row.append(toolbar);
    frag.append(row);
  });                
           
  $('#locationTableBody').append(frag);
}




// ----------------------------------------------------
// PERSONNEL EDIT: FORM PRESENTATION

$("#editPersonnelModal").on("show.bs.modal", function(e) {
  
  $.ajax({
    url:
      "../php/get_personnel_by_id.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id") 
    }

    }).done(function(result) {
    var resultCode = result.status.code;

      if (resultCode == 200) {
        
        $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);
        $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
        $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
        $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
        $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);
        $("#editPersonnelDepartment").find('option').remove();
        $.each(result.data.department, function () {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: this.id,
              text: this.name
            })
          );
        });
        $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
      
      // Status code is not 200
      } else {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
      appErrorLogger('Get Personnel By ID', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
});




// ----------------------------------------------------
// PERSONNEL EDIT: MODAL CLEANUP ON CLOSE

$('#editPersonnelModal').on('hidden.bs.modal', async function () {
  $(this).find('#editPersonnelForm').trigger('reset');
  personnel = await getPersonnel();
  presentPersonnel(personnel);
});




// ----------------------------------------------------
// PERSONNEL EDIT: FORM SUBMIT HANDLER

// Executes when the form button with type="submit" is clicked
$("#editPersonnelForm").on("submit", function (e) {

  e.preventDefault();

  $.ajax({
    url: "../php/edit_personnel.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $("#editPersonnelEmployeeID").val(),
      firstName: $("#editPersonnelFirstName").val(),
      lastName: $("#editPersonnelLastName").val(),
      jobTitle: $("#editPersonnelJobTitle").val(),
      email: $("#editPersonnelEmailAddress").val(),
      departmentID: $("#editPersonnelDepartment").val()
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Edit Personnel', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

  $('#editPersonnelModal').modal('hide')
});




// ----------------------------------------------------
// DEPARTMENT EDIT: FORM PRESENTATION

$("#editDepartmentModal").on("show.bs.modal", function(e) {
  
$.ajax({
  url:
    "../php/get_department_by_id.php",
  type: "POST",
  dataType: "json",
  data: {
    id: $(e.relatedTarget).attr("data-id") 
  }

  }).done(function(result) {
    console.log(JSON.stringify(result));

    if (result.status.code == 200) {
      $("#editDepartmentID").val(result.data.department[0].id);
      $("#editDepartmentName").val(result.data.department[0].name);
      $("#editDepartmentLocation").find('option').remove();
      $.each(result.data.location, function () {
        $("#editDepartmentLocation").append(
          $("<option>", {
            value: this.id,
            text: this.name
          })
        );
      });
      $("#editDepartmentLocation").val(result.data.department[0].locationID);
    
    // Status code is not 200
    } else {
      if (!result.status.description) {
        result.status.description = "There's been an unexpected problem but it will be investigated";
      }
      errorMessage = result.status.description;
      displayErrorPage('body',errorMessage);
    }

    }).fail(function(jqXHR, textStatus, errorThrown) {
      appErrorLogger('Get Department By ID', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });
});




// ----------------------------------------------------
// DEPARTMENT EDIT: MODAL CLEANUP ON CLOSE FUNCTION

$('#editDepartmentModal').on('hidden.bs.modal', async function () {
  $(this).find('#editDepartmentForm').trigger('reset');
  departments = await getDepartments();
  presentDepartments(departments);  
});




// ----------------------------------------------------
// DEPARTMENT EDIT: FORM SUBMIT HANDLER

// Executes when the form button with type="submit" is clicked
$("#editDepartmentForm").on("submit", function (e) {

  e.preventDefault();

  $.ajax({
    url: "../php/edit_department.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $("#editDepartmentID").val(),
      name: $("#editDepartmentName").val(),
      locationID: $("#editDepartmentLocation").val()
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Edit Department', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

  $('#editDepartmentModal').modal('hide')
});




// ----------------------------------------------------
// LOCATION EDIT: FORM PRESENTATION

$("#editLocationModal").on("show.bs.modal", function(e) {
    
  $.ajax({
    url:
      "../php/get_location_by_id.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id") 
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code == 200) {
        $("#editLocationID").val(result.data.location[0].id);
        $("#editLocationName").val(result.data.location[0].name);

      // Status code is not 200
      } else {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

      }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Get Location By ID', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
      });
  });
  

  

  // ----------------------------------------------------
  // LOCATION EDIT: MODAL CLEANUP ON CLOSE FUNCTION

  $('#editLocationModal').on('hidden.bs.modal', async function () {
    $(this).find('#editLocationForm').trigger('reset');
    locations = await getLocations();
    presentLocations(locations);
  });



  
  // ----------------------------------------------------
  // LOCATION EDIT: FORM SUBMIT HANDLER
  
  // Executes when the form button with type="submit" is clicked
  $("#editLocationForm").on("submit", function (e) {
  
    e.preventDefault();
  
    $.ajax({
      url: "../php/edit_location.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#editLocationID").val(),
        name: $("#editLocationName").val()
      }

      }).done(function(result) {
        console.log(JSON.stringify(result));

        if (result.status.code != "200") {
          if (!result.status.description) {
            result.status.description = "There's been an unexpected problem but it will be investigated";
          }
          errorMessage = result.status.description;
          displayErrorPage('body',errorMessage);
        }
    
      }).fail(function(jqXHR, textStatus, errorThrown) {
          appErrorLogger('Edit Location', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
      });
  
    $('#editLocationModal').modal('hide');
  });







// ----------------------------------------------------
// PERSONNEL DELETE: FORM PRESENTATION

$("#deletePersonnelModal").on("show.bs.modal", function(e) {
  
  $("#deletePersonnelEmployeeID").val($(e.relatedTarget).attr("data-id"))

  $.ajax({
    url:
      "../php/get_personnel_by_id.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id")
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code == 200) {

        // Continue with deleting the row
        $('#deletePersonnelForm').find('.message').remove();
        $("#deletePersonnelForm").append(
          `<p class="message">Are you sure you want to delete 
          <b>${result.data.personnel[0].firstName} ${result.data.personnel[0].lastName}</b>?
          </p>`
        );

      // Status code is not 200
      } else {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
      appErrorLogger('Get Personnel Before Delete Personnel by ID', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
  });
});




// ----------------------------------------------------
// PERSONNEL DELETE: MODAL CLEANUP ON CLOSE FUNCTION

$('#deletePersonnelModal').on('hidden.bs.modal', async function () {
  $(this).find('#deletePersonnelForm').trigger('reset');
  $('#deletePersonnelForm').find('.message').remove();
  personnel = await getPersonnel();
  presentPersonnel(personnel);
});




// ----------------------------------------------------
// PERSONNEL DELETE: FORM SUBMIT HANDLER

$("#deletePersonnelForm").on("submit", function (e) {

  e.preventDefault();

  $.ajax({
    url: "../php/delete_personnel_by_id.php",
    type: "POST",
    dataType: "json",
    data: {
      'id': $("#deletePersonnelEmployeeID").val()
    }
    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Get Departments', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

  $('#deletePersonnelModal').modal('hide');
});




// ----------------------------------------------------
// DEPARTMENT DELETE: FORM PRESENTATION

$("#deleteDepartmentModal").on("show.bs.modal", function(e) {
  
  $("#deleteDepartmentID").val($(e.relatedTarget).attr("data-id"))

  $.ajax({
    url:
      "../php/check_before_delete.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
      table: 'personnel'
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code == 200) {

        if (result.status.description !== 'success') {
          // Disable deleting due to dependent entries
          $('#deleteDepartmentForm').find('.message').remove();
          $("#deleteDepartmentForm").append(`<p class="message"><b>${result.data[0].name}</b> cannot be deleted as there's still <b>${result.data[0].dependents}</b> dependent entries</p>`);
          
          // Alternate the buttons if required
          if ($("#deleteDepartmentModal .modal-footer").children('button[type="submit"]').length > 0) {
            $("#deleteDepartmentModal .modal-footer").children('button[type="submit"]').remove();
          }
          if ($("#deleteDepartmentModal .modal-footer").children('button[type="button"]').text() == "CANCEL") {
            $("#deleteDepartmentModal .modal-footer").children('button[type="button"]').text("CLOSE");
          }
        }
        else {
          // Or continue with deleting the row
          $('#deleteDepartmentForm').find('.message').remove();
          $("#deleteDepartmentForm").append(`<p class="message">Are you sure you want to delete <b>${result.data[0].name}</b>?</p>`)

          // Alternate the buttons if required
          if ($("#deleteDepartmentModal .modal-footer").children('button[type="submit"]').length === 0) {
            $("#deleteDepartmentModal .modal-footer").prepend(`
              <button type="submit" form="deleteDepartmentForm" class="btn btn-outline-danger btn-sm myBtn">DELETE</button>`
            );
          }
          if ($("#deleteDepartmentModal .modal-footer").children('button[type="button"]').text() == "OK") {
            $("#deleteDepartmentModal .modal-footer").children('button[type="button"]').text("CANCEL");
          }
        }
      // Status code is not 200
      } else {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

  }).fail(function(jqXHR, textStatus, errorThrown) {
    appErrorLogger('Check Before Delete Department By ID', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
  });
});




// ----------------------------------------------------
// DEPARTMENT DELETE: MODAL CLEANUP ON CLOSE FUNCTION

$('#deleteDepartmentModal').on('hidden.bs.modal', async function () {
  $(this).find('#deleteDepartmentForm').trigger('reset');
  $('#deleteDepartmentForm').find('.message').remove();
  departments = await getDepartments();
  presentDepartments(departments);
});




// ----------------------------------------------------
// DEPARTMENT DELETE: FORM SUBMIT HANDLER

$("#deleteDepartmentForm").on("submit", function (e) {

  e.preventDefault();

  $.ajax({
    url: "../php/delete_department_by_id.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $("#deleteDepartmentID").val()
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Delete Department', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

  $('#deleteDepartmentModal').modal('hide');
});






// ----------------------------------------------------
// LOCATION DELETE: FORM PRESENTATION

$("#deleteLocationModal").on("show.bs.modal", function(e) {

  $("#deleteLocationID").val($(e.relatedTarget).attr("data-id"));

  $.ajax({
    url:
      "../php/check_before_delete.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
      table: 'department'
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code == 200) {

        if (result.status.description === 'dependents returned') {
          // Disable deleting due to dependent entries
          $('#deleteLocationForm').find('.message').remove();
          $("#deleteLocationForm").append(`<p class="message"><b>${result.data[0].name}</b> cannot be deleted as there's still <b>${result.data[0].dependents}</b> dependent entries</p>`);
          
          // Alternate the buttons if required
          if ($("#deleteLocationModal .modal-footer").children('button[type="submit"]').length > 0) {
            $("#deleteLocationModal .modal-footer").children('button[type="submit"]').remove();
          }
          if ($("#deleteLocationModal .modal-footer").children('button[type="button"]').text() == "CANCEL") {
            $("#deleteLocationModal .modal-footer").children('button[type="button"]').text("OK");
          }          
        }
        else {
          // Or continue with deleting the row
          $('#deleteLocationForm').find('.message').remove();
          $("#deleteLocationForm").append(`<p class="message">Are you sure you want to delete <b>${result.data[0].name}</b>?</p>`)
          
          // Alternate the buttons if required
          if ($("#deleteLocationModal .modal-footer").children('button[type="submit"]').length === 0) {
            $("#deleteLocationModal .modal-footer").prepend(`
              <button type="submit" form="deleteLocationForm" class="btn btn-outline-danger btn-sm myBtn">DELETE</button>`
            );
          }
          if ($("#deleteLocationModal .modal-footer").children('button[type="button"]').text() == "OK") {
            $("#deleteLocationModal .modal-footer").children('button[type="button"]').text("CANCEL");
          }          
        }

      } else {
        // Status code is not 200
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

  }).fail(function(jqXHR, textStatus, errorThrown) {
    appErrorLogger('Check Before Delete Location By ID', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
  });
});




// ----------------------------------------------------
// LOCATION DELETE: MODAL CLEANUP ON CLOSE FUNCTION

$('#deleteLocationModal').on('hidden.bs.modal', async function () {
  $(this).find('#deleteLocationForm').trigger('reset');
  $('#deleteLocationForm').find('.message').remove();
  locations = await getLocations();
  presentLocations(locations);
});




// ----------------------------------------------------
// LOCATION DELETE: FORM SUBMIT HANDLER

// Executes when the form button with type="submit" is clicked
$("#deleteLocationForm").on("submit", function (e) {

  e.preventDefault();

  $.ajax({
    url: "../php/delete_location_by_id.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $("#deleteLocationID").val()
    }

    }).done(function(result) {
      console.log(JSON.stringify(result));

      if (result.status.code != "200") {
        if (!result.status.description) {
          result.status.description = "There's been an unexpected problem but it will be investigated";
        }
        errorMessage = result.status.description;
        displayErrorPage('body',errorMessage);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        appErrorLogger('Delete Location By ID', 'error', `${jqXHR}, ${textStatus}, ${errorThrown}`)
    });

    $('#deleteLocationModal').modal('hide');
});




// ----------------------------------------------------
// UTILITY: SEND A LOG MESSAGE

function appErrorLogger(source, status, message) {

  $.ajax({
    url: '../php/app_logger.php',
    method: 'POST',
    dataType: 'json',
    data: {
       'source': source, 
       'status': status,
       'message': message
    }
    }).done(function(result) {

      // AppErrorLogger was successful
      // In production this should not log to the console
      // Error - supplied message is logged and a generic error message presented
      // Warning - supplied message is logged and also presented
      // Info - supplied message is logged but not presented

      //console.log(JSON.stringify(result));

      if (result.status.code == "200") {
        if (result.status.name == 'failure' || result.status.name == 'critical failure') {
          displayErrorPage('body',errorMessage="Unfortunately, an error condition was met");
        }
        //if (result['status']['name'] == 'warning') {
        //  errorMessage = result['status']['description'];
        //  displayErrorPage('body',errorMessage);
        //}
      }
      else {
        // There's been a problem with appErrorLogger
        displayErrorPage('body',errorMessage="There's been an unexpected problem, please reach out to support")
      }

    // There's been a wider issue
    }).fail( function(jqXHR, textStatus, errorThrown) {
      displayErrorPage('body',errorMessage="Unforeseen technical issues have occurred");
    });
}




// ----------------------------------------------------
// UTILITY: DISPLAY ERROR PAGE

function displayErrorPage(component,errorMessage) {
  if (errorMessage == null) {
    errorMessage = "Oh no, there's something not quite right";
  }

  // Display error page in cover form
  if (component === 'body') {
    $('body').replaceWith(`
    <div id="errorStyle" class="container mt-2 mb-2 pt-2 pb-2 text-center">
      <h1 class="pt-5">&#x1F615;</h1>
        <h5 class="pb-3">There's been a problem</h5>
        <p class="p-3 fw-bold">${errorMessage}</p>
      <p>If the issue persists, please make <a href='#'>contact</a></p>
      <a class="focusButton" href='/'><div class="button1 buttonShine mx-auto">BACK TO HOMEPAGE</div></a>
    </div>
    `);
  }

  else {
    // Display error page in modals
    $(component).replaceWith(`
    <div id="errorStyle" class="container mt-2 mb-2 pt-1 pb-2 text-center">
      <h1 class="pt-5">&#x1F615;</h1>
        <h5 class="pb-3">There's been a problem</h5>
        <p class="p-3 fw-bold">${errorMessage}</p>
      <p>If the issue persists, please make <a href='#'>contact</a></p>
    </div>
    `);
  }
}




// ----------------------------------------------------
// INIT: STARTUP CODE

async function init() {

  // Initial table view is personnel
  personnel = await getPersonnel();
  presentPersonnel(personnel);

}




// ----------------------------------------------------
// INIT: TOP LEVEL CONTROL CODE

try {
  init();
}
catch (err) {
  errorMessage = "Unforeseen technical issues have occurred";
  displayErrorPage('body', errorMessage);
}
