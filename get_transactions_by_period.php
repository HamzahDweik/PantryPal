<?php
// get_transactions_by_period.php

// Database connection
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
    $customerID = $_GET['CustomerID'];
    $period = $_GET['period'];

    // SQL query to retrieve transactions based on the selected time period
    $sql = '';
    $stmt = null;

    // Current date values
    $currentMonth = date('m');
    $currentYear = date('Y');

    // Adjust the SQL query based on the selected time period
    switch ($period) {
        case 'current month':
            $sql = "SELECT T.*
                    FROM Transactions T
                    JOIN Carts C ON T.TransactionID = C.TransactionID
                    WHERE C.CustomerID = ?
                    AND MONTH(T.TransactionDate) = ?
                    AND YEAR(T.TransactionDate) = ?;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iii", $customerID, $currentMonth, $currentYear);
            break;
        case 'last 3 months':
            $sql = "SELECT T.*
                    FROM Transactions T
                    JOIN Carts C ON T.TransactionID = C.TransactionID
                    WHERE C.CustomerID = ?
                    AND T.TransactionDate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH);";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $customerID);
            break;
        case 'last year':
            $lastYear = $currentYear - 1;
            $sql = "SELECT T.*
                    FROM Transactions T
                    JOIN Carts C ON T.TransactionID = C.TransactionID
                    WHERE C.CustomerID = ?
                    AND YEAR(T.TransactionDate) = ?;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $customerID, $lastYear);
            break;
        default:
            echo '<p>Invalid time period specified.</p>';
            break;
    }

    // Execute the SQL query if prepared statement is set
    if ($stmt && $stmt->execute()) {
        $result = $stmt->get_result();
        echo "<ul>";
        while ($row = $result->fetch_assoc()) {
            echo "<li>TransactionID: " . $row['TransactionID'] . ", TransactionDate: " . $row['TransactionDate'] . ", TotalPrice: " . $row['TotalPrice'] . "</li>";
        }
        echo "</ul>";
        $stmt->close();
    } else {
        echo '<p>Error fetching transactions: ' . ($stmt ? $stmt->error : 'Invalid statement') . '</p>';
    }

} else {
    echo '<p>Invalid request method.</p>';
}

// Close the database connection
$conn->close();
?>