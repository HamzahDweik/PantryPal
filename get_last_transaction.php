<?php
$host = 'localhost';
$username = 'root';
$dbPassword = '';
$database = 'PantryPal';

// Create a new MySQLi connection
$conn = new mysqli($host, $username, $dbPassword, $database);

// Check if the connection was successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Assuming you receive the CustomerID from the request parameters
    $customerID = $conn->real_escape_string($_GET['CustomerID']);
    echo "<h3>Transactions for Customer ID: $customerID</h3>";

    // Perform the modified query using the variable $customerID
    $query = "SELECT Transactions.*
              FROM Transactions
              JOIN Carts ON Transactions.TransactionID = Carts.TransactionID
              WHERE Carts.CustomerID = $customerID
              ORDER BY TransactionDate DESC";

    $result = $conn->query($query);

    if ($result) {
        if ($result->num_rows > 0) {
            // Output all transactions details
            while ($row = $result->fetch_assoc()) {
                echo '<p>Date: ' . $row['TransactionDate'] . '</p>';
                echo '<p>Total Price: $' . number_format($row['TotalPrice'], 2) . '</p>';
                // Add other details as needed
                echo '<hr>';
            }
        } else {
            echo '<p>No transactions found.</p>';
        }
    } else {
        echo '<p>Error fetching transaction data: ' . $conn->error . '</p>';
    }

    // Close the database connection
    $conn->close();
} else {
    echo '<p>Invalid request method.</p>';
}
?>
