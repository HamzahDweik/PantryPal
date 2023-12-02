<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($_POST['inventory'])) {
    $inventory = $_POST['inventory'];
    $type = isset($_POST['type']) ? $_POST['type'] : 'xml';

    if ($type === 'xml') {
        $filePath = 'inventory.xml';
    } else {
        $filePath = 'inventory.json';
    }

    if ($type === 'json') {
        $inventory = json_encode(json_decode($inventory, true), JSON_PRETTY_PRINT);
    }

    if (file_put_contents($filePath, $inventory) !== false) {
        echo "Inventory updated successfully";
    } else {
        echo "Error updating inventory";
    }
} else {
    echo "No inventory data received";
}
?>
