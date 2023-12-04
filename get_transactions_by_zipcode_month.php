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
$queryZipcode = $input['queryZipcode'];
$queryMonth = $input['queryMonth'];

$query = "SELECT c.CustomerID, COUNT(t.TransactionID) AS TransactionsCount
        FROM Customers c
        JOIN Carts ca ON c.CustomerID = ca.CustomerID
        JOIN Transactions t ON ca.TransactionID = t.TransactionID
        WHERE c.Address LIKE CONCAT('%', ?, '%')
        AND MONTH(t.TransactionDate) = ?
        GROUP BY c.CustomerID, c.FirstName, c.LastName, c.Email, c.Address
        HAVING COUNT(t.TransactionID) > 2";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $queryZipcode, $queryMonth);
$stmt->execute();
$result = $stmt->get_result();

$customers = [];
while ($row = $result->fetch_assoc()) {
    $customers[] = $row;
}

echo json_encode(['customers' => $customers]);

$conn->close();
?>
