<?php

$env = parse_ini_file(__DIR__ . '/../../.env');

$cd_host = $env['CD_HOST'];
$cd_user = $env['CD_USER'];
$cd_password = $env['CD_PASSWORD'];
$cd_dbname = $env['CD_DBNAME'];
$cd_port = (int)$env['CD_PORT'];

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>