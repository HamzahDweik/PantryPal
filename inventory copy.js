
if(document.getElementById("cartTable")) {
    displayCart();
    console.log("called")
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
        // Ensure item.price is a number
        var price = parseFloat(item.price);
        if (isNaN(price)) {
            console.error('Invalid price for item:', item);
            price = 0; // Set to 0 if invalid
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
            updateCartTable(data.cartItems);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateCartTable(cartItems) {
    var tableBody = document.querySelector("#cartTable tbody");
    tableBody.innerHTML = ''; // Clear existing rows

    cartItems.forEach(item => {
        var price = parseFloat(item.price);
        if (isNaN(price)) {
            console.error('Invalid price for item:', item);
            price = 0; // Set to 0 if invalid
        }

        var row = document.createElement("tr");
        var itemNameCell = document.createElement("td");
        itemNameCell.textContent = item.name;
        var quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity;
        var priceCell = document.createElement("td");
        priceCell.textContent = `$${price.toFixed(2)}`;
        var totalPriceCell = document.createElement("td");
        totalPriceCell.textContent = `$${(price * item.quantity).toFixed(2)}`;
        row.appendChild(itemNameCell);
        row.appendChild(quantityCell);
        row.appendChild(priceCell);
        row.appendChild(totalPriceCell);
        tableBody.appendChild(row);
    });


    var finalRow = document.createElement("tr");
    finalRow.appendChild(document.createElement("td"));
    finalRow.appendChild(document.createElement("td"));
    finalRow.appendChild(document.createElement("td"));
    var totalCell = document.createElement("td");
    totalCell.textContent = `$${calculateTotal(cartItems)}`;
    finalRow.appendChild(totalCell);
    tableBody.appendChild(finalRow);
}


function clearCartDisplay() {
    var tableBody = document.querySelector("#cartTable tbody");
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    appendTotal(tableBody);
}


function cancelOrder() {
    var cartItems = cartXmlDoc.querySelectorAll('product');

    cartItems.forEach((item) => {
        var productName = item.getAttribute('name');
        var quantityToReturn = parseInt(item.querySelector('quantity').textContent);

        var productInXml = xmlInventory.querySelector(`product[name='${productName}']`);
        if (productInXml) {
            var currentQuantityXml = parseInt(productInXml.querySelector('quantity').textContent);
            productInXml.querySelector('quantity').textContent = currentQuantityXml + quantityToReturn;
        } else {
            var productInJson = jsonInventory.products.find(p => p.name === productName);
            if (productInJson) {
                productInJson.quantity += quantityToReturn;
            }
        }
    });

    while (cartXmlDoc.firstChild) {
        cartXmlDoc.removeChild(cartXmlDoc.firstChild);
    }

    updateInventoryOnServer(new XMLSerializer().serializeToString(xmlInventory), true);
    updateInventoryOnServer(JSON.stringify(jsonInventory), false);
    localStorage.setItem('cart', new XMLSerializer().serializeToString(cartXmlDoc));
    clearCartDisplay();
}

function placeOrder() {
    while (cartXmlDoc.firstChild) {
        cartXmlDoc.removeChild(cartXmlDoc.firstChild);
    }
    localStorage.setItem('cart', new XMLSerializer().serializeToString(cartXmlDoc));
    clearCartDisplay();
}


