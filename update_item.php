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
$itemNumber = $input['itemNumber'];
$unitPrice = $input['unitPrice'];
$quantity = $input['quantity'];

$stmt = $conn->prepare("UPDATE Inventory SET UnitPrice = ?, QuantityInInventory = ? WHERE ItemNumber = ?");
$stmt->bind_param("dii", $unitPrice, $quantity, $itemNumber);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
