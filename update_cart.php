<?php

header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'PantryPal';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(['error' => "Connection failed: " . $conn->connect_error]));
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

$customerId = $input['customerId'];
$productName = $input['productName'];
$quantity = $input['quantity'];
$price = $input['price'];
$cartStatus = 'Pending';
$transactionStatus = 'In Cart';
$newTotalPrice = $quantity * $price;
$transactionDate = date('Y-m-d');

$conn->begin_transaction();

try {
    $stmt = $conn->prepare("SELECT ItemNumber FROM Inventory WHERE Name = ?");
    $stmt->bind_param("s", $productName);
    $stmt->execute();
    $inventoryResult = $stmt->get_result();

    if ($inventoryResult->num_rows === 0) {
        throw new Exception("Product not found.");
    }

    $row = $inventoryResult->fetch_assoc();
    $itemNumber = $row['ItemNumber'];

    $stmt = $conn->prepare("SELECT TransactionID, Quantity FROM Carts WHERE CustomerID = ? AND ItemNumber = ? AND CartStatus = ?");
    $stmt->bind_param("iis", $customerId, $itemNumber, $cartStatus);
    $stmt->execute();
    $cartResult = $stmt->get_result();

    $transactionId = null;

    if ($cartResult->num_rows > 0) {
        $cartRow = $cartResult->fetch_assoc();
        $existingQuantity = $cartRow['Quantity'];
        $transactionId = $cartRow['TransactionID'];

        $newQuantity = $existingQuantity + $quantity;
        $stmt = $conn->prepare("UPDATE Carts SET Quantity = ? WHERE CustomerID = ? AND ItemNumber = ? AND TransactionID = ?");
        $stmt->bind_param("iiii", $newQuantity, $customerId, $itemNumber, $transactionId);
        $stmt->execute();
    } else {
        $stmt = $conn->prepare("SELECT TransactionID FROM Carts WHERE CustomerID = ? AND CartStatus = 'Pending'");
        $stmt->bind_param("i", $customerId);
        $stmt->execute();
        $transactionResult = $stmt->get_result();

        if ($transactionResult->num_rows > 0) {
            $transactionRow = $transactionResult->fetch_assoc();
            $transactionId = $transactionRow['TransactionID'];
        } else {
            $stmt = $conn->prepare("INSERT INTO Transactions (TransactionStatus, TransactionDate, TotalPrice) VALUES (?, ?, 0)");
            $stmt->bind_param("ss", $transactionStatus, $transactionDate);
            $stmt->execute();
            $transactionId = $conn->insert_id;
        }

        $stmt = $conn->prepare("INSERT INTO Carts (CustomerID, ItemNumber, Quantity, TransactionID, CartStatus) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iiiis", $customerId, $itemNumber, $quantity, $transactionId, $cartStatus);
        $stmt->execute();
    }

    $stmt = $conn->prepare("UPDATE Transactions SET TotalPrice = TotalPrice + ?, TransactionDate = ? WHERE TransactionID = ?");
    $stmt->bind_param("dsi", $newTotalPrice, $transactionDate, $transactionId);
    $stmt->execute();

    $stmt = $conn->prepare("UPDATE Inventory SET QuantityInInventory = QuantityInInventory - ? WHERE ItemNumber = ?");
    $stmt->bind_param("ii", $quantity, $itemNumber);
    $stmt->execute();

    $conn->commit();
    echo json_encode(["message" => "Cart and transaction updated successfully", "transactionId" => $transactionId]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
