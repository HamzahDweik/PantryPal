<?php
$host = 'localhost';
$username = 'root';
$dbPassword = '';
$database = 'PantryPal';

$conn = new mysqli($host, $username, $dbPassword, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $customerID = $conn->real_escape_string($_GET['CustomerID']);
    echo "<h3>Transactions for Customer ID: $customerID</h3>";

    $query = "SELECT Transactions.*
              FROM Transactions
              JOIN Carts ON Transactions.TransactionID = Carts.TransactionID
              WHERE Carts.CustomerID = $customerID
              ORDER BY TransactionDate DESC";

    $result = $conn->query($query);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                echo '<p>Date: ' . $row['TransactionDate'] . '</p>';
                echo '<p>Total Price: $' . number_format($row['TotalPrice'], 2) . '</p>';
                echo '<hr>';
            }
        } else {
            echo '<p>No transactions found.</p>';
        }
    } else {
        echo '<p>Error fetching transaction data: ' . $conn->error . '</p>';
    }

    $conn->close();
} else {
    echo '<p>Invalid request method.</p>';
}
?>
