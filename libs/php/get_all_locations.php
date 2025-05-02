<?php

// Slightly different structure

// Configure error reporting
// Comment out for production
//error_reporting(E_ALL);
//ini_set('log_errors', 'On');
//ini_set('display_errors', 'On');

// Performance counter
$executionStartTime = microtime(true);

// Import the db connection config	
include("config.php");

// Set the response header
header('Content-Type:application/json; charset=UTF-8');

// Return a 500 if all else fails
$output['status']['code'] = "500";
$output['status']['name'] = "critical failure";
$output['status']['description'] = "An unexpected error has occured";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = null;

// Check for db server connection problem
if (mysqli_connect_errno()) {
  $output['status']['code'] = "503";
  $output['status']['name'] = "failure";
  $output['status']['description'] = "There's been a problem connecting to the backend database";
  $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
  $output['data'] = null;
  error_log(sprintf("Connect failed: %s\n", $conn->connect_error), 0);
  mysqli_close($conn);
}

else {
  $query = '
    SELECT id, name
    FROM location
    ORDER BY name
  ';
  $result = $conn->query($query);

  if ($result === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "query failed";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = null;
    error_log("Company Directory Get All Locations Query Failure",0);
    mysqli_close($conn);
  }
  else {
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
      array_push($data, $row);
    }
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $data;
    mysqli_close($conn);
  }
}

// Log a critical error if there's a problem
if ($output['status']['name'] == "critical failure") {
  error_log("Company Directory Get All Locations Critical Failure");
}

echo json_encode($output);