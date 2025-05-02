<?php

/* 
  At this time, this is specifically for handling application issues, such as end-user, JavaScript and Ajax.
  Otherwise, Database, HTTP and network issues are dealt with in their separate php routines, or at the server level.  
  A log file is created (for now in the current working directory) for AppErrorLog entries.
  This should accommodate all the error handling capabilities and return nice error messages for presentation.  
*/

// Configure error reporting
// Comment out for production
//error_reporting(E_ALL);
//ini_set('log_errors', 'On');
//ini_set('display_errors', 'On');

// Performance counter
$executionStartTime = microtime(true);

// Set the response header
header('Content-Type: application/json; charset=UTF-8');

// Supply a path and name for a log file
$applog_file = "app.log";

// Take action if the POST values are not present or are empty
if (!isset($_POST['source'])
|| empty($_POST['source'])
|| !isset($_POST['status'])
|| empty($_POST['status'])
|| !isset($_POST['message'])
|| empty($_POST['message'])
){
  $output['status']['code'] = "500";
  $output['status']['name'] = "failure";
  $output['status']['description'] = "There seems to be an internal problem with the application.";
  $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
  $output['data'] = null;
  error_log("AppLogger POST Variables Error", 0);
}
  
else {
  // Otherwise create the log entry
  $rightnow = date('Y-m-d_H:i:s');
  $source = $_POST['source'];
  $status = $_POST['status'];
  $message = $_POST['message'];
  $logmessage = "\n" . $rightnow .  " - " . $source . " - " . $status .  ": " . "$message";

  try {
    file_put_contents($applog_file, $logmessage, FILE_APPEND);
  }

  catch (Exception $exception) {
    $err = $exception->getMessage();
    error_log("AppLogger Write Error: " . $err, 0);
  }      

  // Prepare a success json response for ajax
  // This will inform the error message displayed on the webpage
  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
  $output['data']['status'] = $status;
  $output['data']['message'] = $message;
  //$output['data']['source'] = $source;
}

// Return the json response
echo json_encode($output);