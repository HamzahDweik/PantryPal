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
$timeFrame = $input['timeFrame'];
$customerId = $input['customerID'];
$specifiedYear = isset($input['year']) ? $input['year'] : null;


switch ($timeFrame) {
    case 'currentMonth':
        $query = "SELECT T.* FROM Transactions T
                  JOIN Carts C ON T.TransactionID = C.TransactionID
                  WHERE C.CustomerID = ? AND MONTH(T.TransactionDate) = MONTH(CURRENT_DATE()) AND YEAR(T.TransactionDate) = YEAR(CURRENT_DATE())";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $customerId);
        break;
    case 'last3Months':
        $query = "SELECT T.* FROM Transactions T
                    JOIN Carts C ON T.TransactionID = C.TransactionID
                    WHERE C.CustomerID = ? AND T.TransactionDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $customerId);
        break;
    case 'year':
        $query = "SELECT T.* FROM Transactions T
                    JOIN Carts C ON T.TransactionID = C.TransactionID
                    WHERE C.CustomerID = ? AND YEAR(T.TransactionDate) = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $customerId, $specifiedYear);
        break;
    default:
        echo json_encode(['error' => 'Invalid time frame specified']);
        exit;
}

if (!$stmt->execute()) {
    echo json_encode(['error' => $stmt->error]);
    exit;
}

$result = $stmt->get_result();

$transactions = [];
while ($row = $result->fetch_assoc()) {
    $transactions[] = $row;
}

echo json_encode(['transactions' => $transactions]);

$stmt->close();
$conn->close();
?>
