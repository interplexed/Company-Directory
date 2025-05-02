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
	SELECT 
	p.id, 
	p.firstName, 
	p.lastName, 
	p.email, 
	p.jobTitle, 
	d.id as departmentID, 
	d.name AS departmentName, 
	l.id as locationID, 
	l.name AS locationName 
	FROM personnel p 
	LEFT JOIN department d ON (d.id = p.departmentID) 
	LEFT JOIN location l ON (l.id = d.locationID) 
	WHERE p.firstName LIKE ? OR p.lastName LIKE ? OR p.email LIKE ? OR p.jobTitle LIKE ? OR d.name LIKE ? OR l.name LIKE ? 
	ORDER BY p.lastName, p.firstName, d.name, l.name
');
$likeText = "%" . $_POST['txt'] . "%";

if ($query === false) {
	$output['status']['code'] = "400";
	$output['status']['name'] = "failure";
	$output['status']['description'] = "query preparation failed";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = [];
	mysqli_close($conn);
	echo json_encode($output); 
	exit;
}

$query->bind_param("ssssss", $likeText, $likeText, $likeText, $likeText, $likeText, $likeText);

if (!$query->execute()) {
	$output['status']['code'] = "400";
	$output['status']['name'] = "failure";
	$output['status']['description'] = "query execution failed";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = [];
	mysqli_close($conn);
	echo json_encode($output);
	exit;
}
	
$result = $query->get_result();
$found = [];
while ($row = mysqli_fetch_assoc($result)) {
	array_push($found, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['found'] = $found;
mysqli_close($conn);
echo json_encode($output); 
?>