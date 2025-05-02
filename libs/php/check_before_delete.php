<?php

// This is a pre-delete (i.e. pre-confirm) check for Departments and Locations
// If joined dependents exist in Personal or Department tables (respectively) then deleting is not allowed

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

// Query for check before delete
if ($_POST['table']  == 'personnel') {
	$query = $conn->prepare('
	SELECT id, name, locationID 
	FROM department WHERE id =  ?
	');
	$query->bind_param("i", $_POST['id']);
	$query->execute();
	
	if (false === $query) {
		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		echo json_encode($output); 
		mysqli_close($conn);
		exit;
	}

	$result = $query->get_result();
		$result_array = [];
		while ($row = mysqli_fetch_assoc($result)) {
		array_push($result_array, $row);
	}
}

else {
	$query = $conn->prepare('SELECT id, name FROM location WHERE id =  ?');
	$query->bind_param("i", $_POST['id']);
	$query->execute();
	
	if (false === $query) {
		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		echo json_encode($output); 
		mysqli_close($conn);
		exit;
	}

	$result = $query->get_result();
		$result_array = [];
		while ($row = mysqli_fetch_assoc($result)) {
		array_push($result_array, $row);
	}
}

// Queries to enumerate dependent personnel (for department) or dependent departments (for location)
// Ternary operator used for this
$_POST['table']  == 'personnel'
? $query = $conn->prepare('
	SELECT COUNT(id) 
	FROM personnel
	WHERE personnel.departmentID = ?
')
: $query = $conn->prepare('
	SELECT COUNT(id) 
	FROM department 
	WHERE department.locationID = ?
');
$query->bind_param("i", $_POST['id']);
$query->execute();

if (false === $query) {
	$output['status']['code'] = "400";
	$output['status']['name'] = "executed";
	$output['status']['description'] = "query failed";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];
	mysqli_close($conn);
	echo json_encode($output); 
	exit;
}

$result = $query->get_result();
$data = [];
foreach (mysqli_fetch_assoc($result) as $key => $value) {
	array_push($data, $value);
	if ($value > 0) {
			// Update the array containing the row to be deleted with the number of dependents found
			foreach ($result_array as &$row) {
			$row['dependents'] = $value;
		}
		unset($row);

		$output['status']['code'] = "200";
		$output['status']['name'] = "ok";
		$output['status']['description'] = "dependents returned";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = $result_array;
		mysqli_close($conn);
		echo json_encode($output);
		exit;
	}
	else {
		$output['status']['code'] = "200";
		$output['status']['name'] = "ok";
		$output['status']['description'] = "success";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = $result_array;
		mysqli_close($conn);
		echo json_encode($output);
	}
}
?>