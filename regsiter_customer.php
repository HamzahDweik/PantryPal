<?php
$host = 'localhost';
$dbname = 'your_database_name';
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $userName = $_POST['userName'];
    $password = $_POST['password']; 
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $dob = $_POST['dob'];
    $email = $_POST['email'];
    $address = $_POST['address'];

    if(empty($userName) || empty($password) || empty($firstName) || empty($lastName) || empty($dob) || empty($email) || empty($address)) {
        echo json_encode(['success' => false, 'error' => 'All fields are required.']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $customerID = uniqid('cust_');

    try {
        $pdo->beginTransaction();

        $sql = "INSERT INTO user (username, password) VALUES (:username, :password)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
        $stmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
        $stmt->execute();

        $sql = "INSERT INTO customer (customer_id, first_name, last_name, dob, email, address) VALUES (:customer_id, :first_name, :last_name, :dob, :email, :address)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':customer_id', $customerID, PDO::PARAM_STR);
        $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $stmt->bindParam(':dob', $dob, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':address', $address, PDO::PARAM_STR);
        $stmt->execute();

        $pdo->commit();

        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>
