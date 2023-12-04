<?php

header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'PantryPal';

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);
$queryDate = $input['queryDate'];

$query = "SELECT C.CustomerID, COUNT(T.TransactionID) AS TransactionsCount
          FROM Transactions T
          JOIN Carts C ON T.TransactionID = C.TransactionID
          WHERE DATE(T.TransactionDate) = ?
          GROUP BY C.CustomerID
          HAVING COUNT(T.TransactionID) > 2";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $queryDate);
$stmt->execute();
$result = $stmt->get_result();

$customers = [];
while ($row = $result->fetch_assoc()) {
    $customers[] = $row;
}

echo json_encode(['customers' => $customers]);

$conn->close();
?>
