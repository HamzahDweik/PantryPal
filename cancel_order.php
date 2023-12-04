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
    $stmt = $conn->prepare("SELECT Carts.ItemNumber, Carts.Quantity FROM Carts WHERE CustomerID = ? AND CartStatus = 'Pending'");
    $stmt->bind_param("i", $customerId);
    $stmt->execute();
    $cartResult = $stmt->get_result();

    while ($cartItem = $cartResult->fetch_assoc()) {
        $stmtUpdateInventory = $conn->prepare("UPDATE Inventory SET QuantityInInventory = QuantityInInventory + ? WHERE ItemNumber = ?");
        $stmtUpdateInventory->bind_param("ii", $cartItem['Quantity'], $cartItem['ItemNumber']);
        $stmtUpdateInventory->execute();
    }

    $stmtUpdateCart = $conn->prepare("UPDATE Carts SET CartStatus = 'Cancelled' WHERE CustomerID = ? AND CartStatus = 'Pending'");
    $stmtUpdateCart->bind_param("i", $customerId);
    $stmtUpdateCart->execute();

    $stmtUpdateTransaction = $conn->prepare("UPDATE Transactions SET TransactionStatus = 'Cancelled' WHERE TransactionID IN (SELECT TransactionID FROM Carts WHERE CustomerID = ? AND CartStatus = 'Cancelled')");
    $stmtUpdateTransaction->bind_param("i", $customerId);
    $stmtUpdateTransaction->execute();

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Order cancelled successfully']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
