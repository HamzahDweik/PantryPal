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

// Assuming you receive the date as a parameter, adjust this based on your requirements
$date = isset($_GET['date']) ? $_GET['date'] : '';

if ($date !== '') {
    // Retrieve transaction IDs on the specified date
    $sqlTransactions = "SELECT TransactionID FROM Transactions WHERE TransactionDate = ?";
    $stmtTransactions = $conn->prepare($sqlTransactions);

    if ($stmtTransactions) {
        $stmtTransactions->bind_param("s", $date);
        $stmtTransactions->execute();
        $resultTransactions = $stmtTransactions->get_result();

        // Array to store customer IDs with more than two transactions
        $customersWithMoreThanTwoTransactions = array();

        while ($rowTransactions = $resultTransactions->fetch_assoc()) {
            $transactionID = $rowTransactions['TransactionID'];

            // Check the cart table to count transactions for each customer
            $sqlCartCount = "SELECT CustomerID FROM Carts WHERE TransactionID = ?";
            $stmtCartCount = $conn->prepare($sqlCartCount);

            if ($stmtCartCount) {
                $stmtCartCount->bind_param("i", $transactionID);
                $stmtCartCount->execute();
                $resultCartCount = $stmtCartCount->get_result();

                while ($rowCartCount = $resultCartCount->fetch_assoc()) {
                    $customerID = $rowCartCount['CustomerID'];

                    // Increment the count for each customer
                    if (isset($customersWithMoreThanTwoTransactions[$customerID])) {
                        $customersWithMoreThanTwoTransactions[$customerID]++;
                    } else {
                        $customersWithMoreThanTwoTransactions[$customerID] = 1;
                    }
                }

                $stmtCartCount->close();
            }
        }

        $stmtTransactions->close();

        // Output the table
        echo "<table border='1'>
                <tr>
                    <th>Date</th>
                    <th>Customer ID</th>
                </tr>";

        foreach ($customersWithMoreThanTwoTransactions as $customerID => $transactionCount) {
            if ($transactionCount > 2) {
                echo "<tr>
                        <td>$date</td>
                        <td>$customerID</td>
                    </tr>";
            }
        }

        echo "</table>";
    } else {
        echo "Error preparing SQL statement: " . $conn->error;
    }
} else {
    echo "Date parameter is required.";
}

// Close connection
$conn->close();

?>
