<?php

header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'PantryPal';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    echo json_encode(['error' => "Connection failed: " . $conn->connect_error]);
    exit;
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);
$customerId = $input['customerId'];

$conn->begin_transaction();

try {
    $stmtUpdateCart = $conn->prepare("UPDATE Carts SET CartStatus = 'Shopped' WHERE CustomerID = ? AND CartStatus = 'Pending'");
    $stmtUpdateCart->bind_param("i", $customerId);
    $stmtUpdateCart->execute();

    $stmtUpdateTransaction = $conn->prepare("UPDATE Transactions SET TransactionStatus = 'Shopped' WHERE TransactionID IN (SELECT TransactionID FROM Carts WHERE CustomerID = ? AND CartStatus = 'Shopped')");
    $stmtUpdateTransaction->bind_param("i", $customerId);
    $stmtUpdateTransaction->execute();

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Order placed successfully']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$stmtUpdateCart->close();
$stmtUpdateTransaction->close();
$conn->close();
?>
