<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_FILES["fileToUpload"])) {
        $filename = $_FILES["fileToUpload"]["tmp_name"];
        $fileType = pathinfo($_FILES["fileToUpload"]["name"], PATHINFO_EXTENSION);

        if ($fileType == "xml") {
            processXML($filename);
        } elseif ($fileType == "json") {
            processJSON($filename);
        } else {
            echo "Unsupported file type.";
        }
    }
}

function processXML($filename) {
    $xml = simplexml_load_file($filename);
    foreach ($xml->product as $product) {
        $name = (string)$product['name'];
        $price = (float)$product->price;
        $quantity = (int)$product->quantity;
        $categories = (string)$product['categories'];
        $categoriesArray = explode(' ', $categories);
        $category = $categoriesArray[0] ?? null;
        $subcategory = $categoriesArray[1] ?? null;
        insertIntoDatabase($name, $category, $subcategory, $price, $quantity);
    }
}


function processJSON($filename) {
    $json = json_decode(file_get_contents($filename), true);
    foreach ($json["products"] as $product) {
        $name = $product["name"];
        $price = $product["price"];
        $quantity = $product["quantity"];
        $categories = explode(' ', $product["categories"]);
        $category = $categories[0] ?? null;
        $subcategory = $categories[1] ?? null;
        insertIntoDatabase($name, $category, $subcategory, $price, $quantity);
    }
}

function insertIntoDatabase($name, $category, $subcategory, $price, $quantity) {
    $host = 'localhost';
    $username = 'root';
    $password = '';
    $database = 'PantryPal';

    $conn = new mysqli($host, $username, $password, $database);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $name = $conn->real_escape_string($name);
    $category = $conn->real_escape_string($category);
    $subcategory = $conn->real_escape_string($subcategory);
    $price = $conn->real_escape_string($price);
    $quantity = $conn->real_escape_string($quantity);

    $sql = "INSERT INTO Inventory (Name, Category, Subcategory, UnitPrice, QuantityInInventory) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        die("Error preparing the SQL statement: " . $conn->error);
    }

    $stmt->bind_param("sssdi", $name, $category, $subcategory, $price, $quantity);

    if ($stmt->execute() === false) {
        die("Error executing the SQL statement: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();
}

