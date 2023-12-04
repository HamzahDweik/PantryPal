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

// Retrieve all items from the Inventory table
$sql = "SELECT * FROM Inventory";
$result = $conn->query($sql);

// Retrieve low inventory items (quantity less than 3)
$sqlLowInventory = "SELECT * FROM Inventory WHERE QuantityInInventory < 3";
$resultLowInventory = $conn->query($sqlLowInventory);

if ($result->num_rows > 0) {
    echo "<h3>Full Inventory</h3>";
    echo "<table border='1'>
            <tr>
                <th>Item Number</th>
                <th>Name</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Unit Price</th>
                <th>Quantity in Inventory</th>
            </tr>";

    // Output data of each row
    while ($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>" . $row["ItemNumber"] . "</td>
                <td>" . $row["Name"] . "</td>
                <td>" . $row["Category"] . "</td>
                <td>" . $row["Subcategory"] . "</td>
                <td>" . $row["UnitPrice"] . "</td>
                <td>" . $row["QuantityInInventory"] . "</td>
            </tr>";
    }

    echo "</table>";
} else {
    echo "<p>Inventory is empty.</p>";
}

if ($resultLowInventory->num_rows > 0) {
    echo "<h3>Low Inventory Items (Quantity less than 3)</h3>";
    echo "<table border='1'>
            <tr>
                <th>Item Number</th>
                <th>Name</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Unit Price</th>
                <th>Quantity in Inventory</th>
            </tr>";

    // Output data of each row for low inventory items
    while ($rowLowInventory = $resultLowInventory->fetch_assoc()) {
        echo "<tr>
                <td>" . $rowLowInventory["ItemNumber"] . "</td>
                <td>" . $rowLowInventory["Name"] . "</td>
                <td>" . $rowLowInventory["Category"] . "</td>
                <td>" . $rowLowInventory["Subcategory"] . "</td>
                <td>" . $rowLowInventory["UnitPrice"] . "</td>
                <td>" . $rowLowInventory["QuantityInInventory"] . "</td>
            </tr>";
    }

    echo "</table>";
} else {
    echo "<p>No items are low in inventory.</p>";
}

// Close connection
$conn->close();

?>
