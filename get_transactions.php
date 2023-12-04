<?php

$host = 'localhost';
$username = 'root';
$dbPassword = '';
$database = 'PantryPal';

$conn = new mysqli($host, $username, $dbPassword, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$date = isset($_GET['date']) ? $_GET['date'] : '';

if ($date !== '') {
    $sqlTransactions = "SELECT TransactionID FROM Transactions WHERE TransactionDate = ?";
    $stmtTransactions = $conn->prepare($sqlTransactions);

    if ($stmtTransactions) {
        $stmtTransactions->bind_param("s", $date);
        $stmtTransactions->execute();
        $resultTransactions = $stmtTransactions->get_result();

        $customersWithMoreThanTwoTransactions = array();

        while ($rowTransactions = $resultTransactions->fetch_assoc()) {
            $transactionID = $rowTransactions['TransactionID'];

            $sqlCartCount = "SELECT CustomerID FROM Carts WHERE TransactionID = ?";
            $stmtCartCount = $conn->prepare($sqlCartCount);

            if ($stmtCartCount) {
                $stmtCartCount->bind_param("i", $transactionID);
                $stmtCartCount->execute();
                $resultCartCount = $stmtCartCount->get_result();

                while ($rowCartCount = $resultCartCount->fetch_assoc()) {
                    $customerID = $rowCartCount['CustomerID'];

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

$conn->close();

?>
