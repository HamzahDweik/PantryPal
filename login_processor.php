<?php

session_start();

$host = 'localhost';
$username = 'root';
$dbPassword = '';
$database = 'PantryPal';

$conn = new mysqli($host, $username, $dbPassword, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = isset($_POST['username']) ? $conn->real_escape_string($_POST['username']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if ($username !== '' && $password !== '') {
    $sql = "SELECT * FROM Users WHERE username = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            if (password_verify($password, $user['Password'])) {

                $_SESSION['CustomerID'] = $user['CustomerID'];
                $_SESSION['UserName'] = $user['UserName'];

                echo "Login successful";
            } else {
                echo "Invalid username or password";
            }
        } else {
            echo "Invalid username or password";
        }

        $stmt->close();
    } else {
        echo "Error preparing SQL statement: " . $conn->error;
    }
} else {
    echo "Username and password are required";
}

$conn->close();

?>
