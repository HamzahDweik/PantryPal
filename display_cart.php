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

<<<<<<< HEAD
$stmt = $conn->prepare("
    SELECT 
        Inventory.ItemNumber,
        Inventory.Category,
        Inventory.Subcategory,
        Inventory.Name,
        Carts.Quantity,
        Inventory.UnitPrice
    FROM 
        Carts 
    INNER JOIN 
        Inventory ON Carts.ItemNumber = Inventory.ItemNumber 
    WHERE 
        Carts.CustomerID = ? AND 
        Carts.CartStatus = 'Pending'
");
=======
$stmt = $conn->prepare("SELECT Inventory.Name, Carts.Quantity, Inventory.UnitPrice FROM Carts INNER JOIN Inventory ON Carts.ItemNumber = Inventory.ItemNumber WHERE Carts.CustomerID = ? AND Carts.CartStatus = 'Pending'");
>>>>>>> rahul2
$stmt->bind_param("i", $customerId);
$stmt->execute();
$result = $stmt->get_result();

$cartItems = [];
while ($row = $result->fetch_assoc()) {
    $cartItems[] = [
<<<<<<< HEAD
        'itemId' => $row['ItemNumber'],
        'category' => $row['Category'],
        'subcategory' => $row['Subcategory'],
=======
>>>>>>> rahul2
        'name' => $row['Name'],
        'quantity' => $row['Quantity'],
        'price' => $row['UnitPrice']
    ];
}

<<<<<<< HEAD
$stmt = $conn->prepare("SELECT TransactionID, TotalPrice FROM Transactions WHERE TransactionID IN (SELECT TransactionID FROM Carts WHERE CustomerID = ? AND CartStatus = 'Pending')");
$stmt->bind_param("i", $customerId);
$stmt->execute();
$transactionResult = $stmt->get_result();

if ($transactionRow = $transactionResult->fetch_assoc()) {
    $transactionId = $transactionRow['TransactionID'];
    $totalPrice = $transactionRow['TotalPrice'];
} else {
    $transactionId = 0;
    $totalPrice = 0.00;
}

echo json_encode(['cartItems' => $cartItems, 'transactionId' => $transactionId, 'totalPrice' => $totalPrice]);
=======
echo json_encode(['cartItems' => $cartItems]);
>>>>>>> rahul2

$stmt->close();
$conn->close();
?>
<<<<<<< HEAD

=======
>>>>>>> rahul2
