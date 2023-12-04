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
$itemId = $input['itemId'];
$transactionId = $input['transactionId'];

$cartStmt = $conn->prepare("SELECT Quantity FROM Carts WHERE ItemNumber = ? AND TransactionID = ?");
$cartStmt->bind_param("ii", $itemId, $transactionId);
$cartStmt->execute();
$cartResult = $cartStmt->get_result();
if ($cartRow = $cartResult->fetch_assoc()) {
    $quantity = $cartRow['Quantity'];

    $inventoryStmt = $conn->prepare("UPDATE Inventory SET QuantityInInventory = QuantityInInventory + ? WHERE ItemNumber = ?");
    $inventoryStmt->bind_param("ii", $quantity, $itemId);
    $inventoryStmt->execute();
}

$updateStmt = $conn->prepare("UPDATE Carts SET CartStatus = 'Cancelled' WHERE ItemNumber = ? AND TransactionID = ?");
$updateStmt->bind_param("ii", $itemId, $transactionId);
$updateStmt->execute();

$checkStmt = $conn->prepare("SELECT COUNT(*) AS RemainingItems FROM Carts WHERE TransactionID = ? AND CartStatus != 'Cancelled'");
$checkStmt->bind_param("i", $transactionId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();
$remainingItems = $checkResult->fetch_assoc()['RemainingItems'];

if ($remainingItems == 0) {
    $transUpdateStmt = $conn->prepare("UPDATE Transactions SET TransactionStatus = 'Cancelled' WHERE TransactionID = ?");
    $transUpdateStmt->bind_param("i", $transactionId);
    $transUpdateStmt->execute();
}

echo json_encode(['success' => true]);

$conn->close();
?>
