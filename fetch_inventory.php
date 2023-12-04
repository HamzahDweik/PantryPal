<?php
$fileType = isset($_GET['type']) ? $_GET['type'] : 'xml';

if ($fileType === 'xml') {
    $filePath = 'inventory.xml';

    if (file_exists($filePath)) {
        $xml = file_get_contents($filePath);
        header('Content-Type: application/xml');
        echo $xml;
    } else {
        echo "Error: XML file not found.";
    }
} elseif ($fileType === 'json') {
    $filePath = 'inventory.json';

    if (file_exists($filePath)) {
        $json = file_get_contents($filePath);
        header('Content-Type: application/json');
        echo $json;
    } else {
        echo "Error: JSON file not found.";
    }
} else {
    echo "Error: Invalid file type specified.";
}
?>
