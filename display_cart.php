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

$stmt = $conn->prepare("SELECT Inventory.Name, Carts.Quantity, Inventory.UnitPrice FROM Carts INNER JOIN Inventory ON Carts.ItemNumber = Inventory.ItemNumber WHERE Carts.CustomerID = ? AND Carts.CartStatus = 'Pending'");
$stmt->bind_param("i", $customerId);
$stmt->execute();
$result = $stmt->get_result();

$cartItems = [];
while ($row = $result->fetch_assoc()) {
    $cartItems[] = [
        'name' => $row['Name'],
        'quantity' => $row['Quantity'],
        'price' => $row['UnitPrice']
    ];
}

echo json_encode(['cartItems' => $cartItems]);

$stmt->close();
$conn->close();
?>
