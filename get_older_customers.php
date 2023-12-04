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

$query = "SELECT c.FirstName, c.LastName, c.Email, COUNT(t.TransactionID) AS TransactionsCount
          FROM Customers c
          JOIN Carts ca ON c.CustomerID = ca.CustomerID
          JOIN Transactions t ON ca.TransactionID = t.TransactionID
          WHERE c.Age > 20
          GROUP BY c.CustomerID
          HAVING COUNT(t.TransactionID) > 3";

$result = $conn->query($query);

if (!$result) {
    echo json_encode(['error' => "Error fetching data: " . $conn->error]);
    exit;
}

$customers = [];
while ($row = $result->fetch_assoc()) {
    $customers[] = $row;
}

echo json_encode(['customers' => $customers]);

$conn->close();
?>
