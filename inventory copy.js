
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
    var searchableDiv = $('.searchable');

    $.ajax({
        url: '../get_products.php',
        type: 'GET',
        data: { category: category },
        dataType: 'json',
        success: function(products) {
            products.forEach(function(product) {
                var productElement;
                console.log(product)
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
            alert(data.message);
            // Here, you can also update the UI to reflect the changes
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Network error or server is down");
    });
}


function calculateTotal() {
    var total = 0;
    
    var productNodes = cartXmlDoc.querySelectorAll('product');
    
    productNodes.forEach(function(productNode) {
        var productTotalPrice = Number(productNode.querySelector('totalPrice').textContent);
        total += productTotalPrice;
    });
    
    return total.toFixed(2);
}


function displayCart() {
    var tableBody = document.querySelector("#cartTable tbody");

    var productNodes = cartXmlDoc.querySelectorAll('product');

    productNodes.forEach(function(productNode) {
        var itemName = productNode.getAttribute('name');
        var itemQuantity = Number(productNode.querySelector('quantity').textContent);
        var itemTotalPrice = Number(productNode.querySelector('totalPrice').textContent);
        var itemPrice = itemTotalPrice / itemQuantity;
        var row = document.createElement("tr");
        var itemNameCell = document.createElement("td");
        itemNameCell.textContent = itemName;
        var quantityCell = document.createElement("td");
        quantityCell.textContent = itemQuantity;
        var priceCell = document.createElement("td");
        priceCell.textContent = `$${itemPrice.toFixed(2)}`;
        var totalPriceCell = document.createElement("td");
        totalPriceCell.textContent = `$${itemTotalPrice.toFixed(2)}`;
        row.appendChild(itemNameCell);
        row.appendChild(quantityCell);
        row.appendChild(priceCell);
        row.appendChild(totalPriceCell);
        tableBody.appendChild(row);
    });
    appendTotal(tableBody);
}

function clearCartDisplay() {
    var tableBody = document.querySelector("#cartTable tbody");
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    appendTotal(tableBody);
}

function appendTotal(body){
    var finalRow = document.createElement("tr");
    finalRow.appendChild(document.createElement("td"));
    finalRow.appendChild(document.createElement("td"));
    finalRow.appendChild(document.createElement("td"));
    var totalCell = document.createElement("td");
    totalCell.textContent = `$${calculateTotal()}`;
    finalRow.appendChild(totalCell);
    body.appendChild(finalRow);
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


