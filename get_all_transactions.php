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
$customerID = $input['customerID'];

$query = "SELECT t.TransactionID, t.TransactionStatus, t.TransactionDate, t.TotalPrice
          FROM Transactions t
          JOIN Carts c ON t.TransactionID = c.TransactionID
          WHERE c.CustomerID = ?
          GROUP BY t.TransactionID, t.TransactionStatus, t.TransactionDate, t.TotalPrice";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $customerID);
$stmt->execute();
$result = $stmt->get_result();

$transactions = [];
while ($row = $result->fetch_assoc()) {
    $transactionID = $row['TransactionID'];

    $cartsQuery = "SELECT * FROM Carts WHERE TransactionID = ?";
    $cartsStmt = $conn->prepare($cartsQuery);
    $cartsStmt->bind_param("i", $transactionID);
    $cartsStmt->execute();
    $cartsResult = $cartsStmt->get_result();

    $carts = [];
    while ($cartRow = $cartsResult->fetch_assoc()) {
        $carts[] = $cartRow;
    }

    $row['Carts'] = $carts;
    $transactions[] = $row;
}

echo json_encode(['transactions' => $transactions]);

$conn->close();
?>
