<?php

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
header('Content-Type: application/json; charset=UTF-8');

if (mysqli_connect_errno()) {
	$output['status']['code'] = "503";
	$output['status']['name'] = "failure";
	$output['status']['description'] = "database unavailable";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];
	mysqli_close($conn);
	echo json_encode($output);
	exit;
}	

$query = $conn->prepare('
	DELETE FROM department 
	WHERE id = ?
');

if ($query === false) {
	$output['status']['code'] = "400";
	$output['status']['name'] = "failure";
	$output['status']['description'] = "query preparation failed";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];
	mysqli_close($conn);
	echo json_encode($output); 
	exit;
}

$query->bind_param("i", $_POST['id']);

if (!$query->execute()) {
	$output['status']['code'] = "400";
	$output['status']['name'] = "failure";
	$output['status']['description'] = "query execution failed";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];
	mysqli_close($conn);
	echo json_encode($output);
	exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

mysqli_close($conn);
echo json_encode($output);
?>