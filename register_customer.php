<?php
// ini_set('display_errors', 1);
// error_reporting(E_ALL);
// error_log(print_r($_POST, true));

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'PantryPal';

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }


$firstName = isset($_POST['firstName']) ? $conn->real_escape_string($_POST['firstName']) : '';
$lastName = isset($_POST['lastName']) ? $conn->real_escape_string($_POST['lastName']) : '';
$dob = isset($_POST['dob']) ? $conn->real_escape_string($_POST['dob']) : null;
$email = isset($_POST['email']) ? $conn->real_escape_string($_POST['email']) : '';
$address = isset($_POST['address']) ? $conn->real_escape_string($_POST['address']) : '';
$userName = isset($_POST['userName']) ? $conn->real_escape_string($_POST['userName']) : '';
$password = isset($_POST['password']) ? $conn->real_escape_string($_POST['password']) : '';

if ($dob) {
    $dob = DateTime::createFromFormat('m/d/Y', $dob);
    $currentDate = new DateTime();
    $age = $currentDate->diff($dob);
    $ageYears = $age->y;
}


$sql = "INSERT INTO Customers (FirstName, LastName, Age, Email, Address) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
if ($stmt === false) { die("Error preparing the SQL statement: " . $conn->error); }
$stmt->bind_param("ssiss", $firstName, $lastName, $ageYears, $email, $address);

if ($stmt->execute()) {
    echo "New customer record created successfully. ";
    $customerID = $stmt->insert_id;

    $userSql = "INSERT INTO Users (CustomerID, UserName, Password) VALUES (?, ?, ?)";
    $userStmt = $conn->prepare($userSql);
    if ($userStmt === false) {
        die("Error preparing the user SQL statement: " . $conn->error);
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $userStmt->bind_param("iss", $customerID, $userName, $hashedPassword);

    if ($userStmt->execute()) {
        echo "New user record created successfully. ";
    } else {
        echo "Error: " . $userStmt->error;
    }

    $userStmt->close();
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>

