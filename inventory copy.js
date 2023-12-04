
if(document.getElementById("cartTable")) {
    displayCart();
    document.getElementById('cancelOrderButton').addEventListener('click', cancelOrder);
    document.getElementById('placeOrderButton').addEventListener('click', placeOrder);
}

function updateInventoryOnServer(updatedInventory, isXml = true) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    };

    xhttp.open("POST", "../update_inventory.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    var data = "inventory=" + encodeURIComponent(updatedInventory) + "&type=" + (isXml ? "xml" : "json");
    xhttp.send(data);
}

function populateProducts(category) {
    var div = $('.productDisplay');

    $.ajax({
        url: '../get_products.php',
        type: 'GET',
        data: { category: category },
        dataType: 'json',
        success: function(products) {
            products.forEach(function(product) {
                var productElement;
                if (product.Subcategory && product.Subcategory.trim() !== '') {
                    productElement = createCategoricalProductStanza(product.Name, parseFloat(product.UnitPrice), product.QuantityInInventory, product.Subcategory);
                    div.append(productElement);
                } else {
                    productElement = createSearchableProductStanza(product.Name, parseFloat(product.UnitPrice), product.QuantityInInventory);
                    div.append(productElement);
                }
            });
        },
        error: function(error) {
            console.log('Error fetching products:', error);
        }
    });

    function createSearchableProductStanza(productName, productPrice, productQuantity) {
        var nameWithoutSpaces = productName.replace(/ /g, '');
    
        var productElement = $(`
            <div class="product">
                <img src="../images/${nameWithoutSpaces}.jpg" alt="${productName}" width="150">
                <h4>${productName}</h4>
                <p>Price: $${productPrice.toFixed(2)}  Quantity: <span id="quant${nameWithoutSpaces}">${productQuantity}</span></p>
                <input type="number" id="amount-${nameWithoutSpaces}">
                <button class="addToCartBtn">Add to Cart</button>
            </div>
        `);
    
        productElement.find('.addToCartBtn').click(function() {
            addXToCart(productName, $('#amount-' + nameWithoutSpaces).val(), productPrice);
        });
    
        return productElement;
    }
    
    function createCategoricalProductStanza(productName, productPrice, productQuantity, productCategories) {
        var nameWithoutSpaces = productName.replace(/\s+/g, '');
    
        var productElement = $(`
            <div class="product all ${productCategories}">
                <img src="../images/${nameWithoutSpaces}.jpg" alt="${productName}" width="150">
                <h4>${productName}</h4>
                <p>Price: $${productPrice.toFixed(2)}  Quantity: <span id="quant${nameWithoutSpaces}">${productQuantity}</span></p>
                <button class="addToCartBtn">Add to Cart</button>
            </div>
        `);
    
        productElement.find('.addToCartBtn').click(function() {
            addXToCart(productName, 1, productPrice);
        });
    
        return productElement;
    }
}

function getCurrentProductQuantity(productName) {
    return fetch('../get_product_quantity.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: productName })
    })
    .then(response => response.json())
    .then(data => {
        if(data.quantity !== undefined) {
            return data.quantity;
        } else {
            throw new Error('Quantity not available');
        }
    })
    .catch(error => {
        console.error('Error fetching product quantity:', error);
        return -1;
    });
}

function addXToCart(productName, quantity, price) {
    getCurrentProductQuantity(productName).then(currentQuantity => {

        if (currentQuantity >= quantity) {
            const customerId = sessionStorage.getItem('CustomerID');
            updateCartInDatabase(customerId, productName, quantity, price);
        } else if (currentQuantity === 0) {
            alert("Sorry, " + productName + " is out of stock!");
        } else {
            alert("Sorry, your request of " + quantity + " " + productName + " exceeds the current inventory!");
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function updateCartInDatabase(customerId, productName, quantity, price) {
    fetch('../update_cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customerId: customerId,
            productName: productName,
            quantity: quantity,
            price: price
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
            alert("Error updating cart: " + data.error);
        } else {
            console.log('Success:', data.message);
            updateDisplayedQuantity(productName, quantity);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Network error or server is down");
    });
}

function updateDisplayedQuantity(productName, quantity) {
    var nameWithoutSpaces = productName.replace(/\s+/g, '');
    var quantityElementId = "quant" + nameWithoutSpaces;
    
    var quantityElement = document.getElementById(quantityElementId);
    if (quantityElement) {
        var currentQuantity = parseInt(quantityElement.textContent);
        if (isNaN(currentQuantity)) {
            console.error('Current quantity is not a number');
            return;
        }

        var newQuantity = currentQuantity - quantity;
        quantityElement.textContent = newQuantity.toString();
    } else {
        console.error('Element with ID ' + quantityElementId + ' not found');
    }
}



function calculateTotal(cartItems) {
    var total = 0;

    cartItems.forEach(function(item) {
        var price = parseFloat(item.price);
        if (isNaN(price)) {
            console.error('Invalid price for item:', item);
            price = 0;
        }
        var itemTotalPrice = item.quantity * price;
        total += itemTotalPrice;
    });

    return total.toFixed(2);
}




function displayCart() {
    var customerId = sessionStorage.getItem('CustomerID'); 

    fetch('../display_cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: customerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            updateCartTable(data.cartItems, data.transactionId, data.totalPrice);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateCartTable(cartItems, transactionId, totalPrice) {
    var tableBody = document.querySelector("#cartTable tbody");
    tableBody.innerHTML = '';

    cartItems.forEach(item => {
        var price = parseFloat(item.price);
        if (isNaN(price)) {
            console.error('Invalid price for item:', item);
            price = 0;
        }

        var row = document.createElement("tr");

        var itemIdCell = document.createElement("td");
        itemIdCell.textContent = item.itemId;
        row.appendChild(itemIdCell);

        var categoryCell = document.createElement("td");
        categoryCell.textContent = item.category;
        row.appendChild(categoryCell);

        var subcategoryCell = document.createElement("td");
        subcategoryCell.textContent = item.subcategory;
        row.appendChild(subcategoryCell);

        var itemNameCell = document.createElement("td");
        itemNameCell.textContent = item.name;
        row.appendChild(itemNameCell);

        var quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);

        var priceCell = document.createElement("td");
        priceCell.textContent = `$${price.toFixed(2)}`;
        row.appendChild(priceCell);

        var totalPriceCell = document.createElement("td");
        totalPriceCell.textContent = `$${(price * item.quantity).toFixed(2)}`;
        row.appendChild(totalPriceCell);

        var removeButtonCell = document.createElement("td");
        var removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.style = "background-color: #f2d5cf;color: #5c4f4b;border: none;border-radius: 10px;padding: 10px 20px;font-size: 12px;font-family: 'Arial', sans-serif;"
        removeButton.onclick = function() { removeCartItem(item.itemId, transactionId); };
        removeButtonCell.appendChild(removeButton);
        row.appendChild(removeButtonCell);

        tableBody.appendChild(row);
    });

    var finalRow = document.createElement("tr");
    var transactionIdCell = document.createElement("td");
    transactionIdCell.textContent = "Transaction ID: " + transactionId;
    transactionIdCell.colSpan = 6;
    finalRow.appendChild(transactionIdCell);

    var totalValueCell = document.createElement("td");
    totalValueCell.textContent = `$${parseFloat(totalPrice).toFixed(2)}`;
    totalValueCell.colSpan = 2;
    finalRow.appendChild(totalValueCell);

    tableBody.appendChild(finalRow);
}

function removeCartItem(itemId, transactionId) {
    fetch('../remove_cart_item.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId, transactionId: transactionId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            displayCart();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



function cancelOrder() {
    var customerId = sessionStorage.getItem('CustomerID');

    fetch('../cancel_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: customerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Order cancelled successfully');
            clearCartDisplay();
        } else {
            console.error('Error cancelling order:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function clearCartDisplay() {
    var tableBody = document.querySelector("#cartTable tbody");
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    var finalRow = document.createElement("tr");
    var transactionIdCell = document.createElement("td");
    transactionIdCell.textContent = "Transaction ID: 0";
    transactionIdCell.colSpan = 6;
    finalRow.appendChild(transactionIdCell);

    var totalValueCell = document.createElement("td");
    totalValueCell.textContent = '$0.00';
    totalValueCell.colSpan = 2;
    finalRow.appendChild(totalValueCell);

    tableBody.appendChild(finalRow);
}


function placeOrder() {
    var customerId = sessionStorage.getItem('CustomerID');

    fetch('../place_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: customerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Order placed successfully');
            clearCartDisplay();
        } else {
            console.error('Error placing order:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


