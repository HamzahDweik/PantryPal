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

$query = "SELECT ItemNumber, Name, Category, Subcategory, UnitPrice, QuantityInInventory FROM Inventory WHERE QuantityInInventory < 3";
$result = $conn->query($query);

if (!$result) {
    echo json_encode(['error' => "Error fetching low quantity inventory: " . $conn->error]);
    exit;
}

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode(['items' => $items]);

$conn->close();
?>
