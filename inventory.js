var xmlInventory = '';
var jsonInventory = '';
var cart = localStorage.getItem('cart') || `<cart></cart>`;
var cartXmlDoc = new DOMParser().parseFromString(cart, "text/xml");

function load_data() {
    function fetchData(type) {
        return new Promise((resolve, reject) => {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        if (type === 'xml') {
                            resolve(this.responseXML);
                        } else if (type === 'json') {
                            resolve(JSON.parse(this.responseText));
                        }
                    } else {
                        reject('Failed to load ' + type + ' data: Status ' + this.status);
                    }
                }
            };
            xhttp.open("GET", "../fetch_inventory.php?type=" + type, true);
            xhttp.send();
        });
    }

    return Promise.all([fetchData('xml'), fetchData('json')])
        .then(values => {
            xmlInventory = values[0];
            jsonInventory = values[1];
        });
}


load_data().then(() => {
    populateProducts();
    if(document.getElementById("cartTable")) {
        displayCart();
        document.getElementById('cancelOrderButton').addEventListener('click', cancelOrder);
        document.getElementById('placeOrderButton').addEventListener('click', placeOrder);
    }
    
}).catch(error => {
    console.error(error);
});


function getProductFromXML(productNode) {
    var productName = productNode.getAttribute('name');
    var productCategories = productNode.hasAttribute('categories') ? productNode.getAttribute('categories') : '';
    var productPrice = parseFloat(productNode.querySelector('price').textContent);
    var productQuantity = parseInt(productNode.querySelector('quantity').textContent);

    return {
        name: productName,
        categories: productCategories,
        price: productPrice,
        quantity: productQuantity
    };
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



function populateProducts() {
    var categoricalDiv = $('.categorical');
    var searchableDiv = $('.searchable');

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
            <div class="${productCategories}">
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

    function findProduct(productName) {
        var productXML = $(xmlInventory).find(`product[name='${productName}']`);
        var productJSON = jsonInventory.products.find(p => p.name === productName);

        if (productXML.length) {
            var categories = productXML.attr('categories') || '';
            return {
                name: productName,
                price: parseFloat(productXML.find('price').text()),
                quantity: parseInt(productXML.find('quantity').text()),
                categories: categories
            };
        } else if (productJSON) {
            return productJSON;
        } else {
            console.log("Product not found: " + productName);
            return null;
        }
    }

    function processProducts(container, products) {
        container.empty();
        $.each(products, function(index, productName) {
            var product = findProduct(productName);
            if (product) {
                var productStanza = (container.hasClass('categorical')) ?
                    createCategoricalProductStanza(product.name, product.price, product.quantity, product.categories) :
                    createSearchableProductStanza(product.name, product.price, product.quantity);
                container.append(productStanza);
            }
        });
    }

    if (categoricalDiv.length) {
        var currentProducts = categoricalDiv.html().split(',');
        processProducts(categoricalDiv, currentProducts);
    }

    if (searchableDiv.length) {
        var currentProducts = searchableDiv.html().split(',');
        processProducts(searchableDiv, currentProducts);
    }
}


function addXToCart(productName, quantity, price) {
    var quantityElement = document.getElementById("quant" + productName.replace(/\s+/g, ''));
    quantity = Number(quantity);

    var productQuantityNode = xmlInventory.querySelector(`product[name='${productName}']`)?.querySelector('quantity');
    var current = productQuantityNode ? parseInt(productQuantityNode.textContent, 10) : -1;
    if (current === -1) {
        var productJSON = jsonInventory.products.find(p => p.name === productName);
        if (productJSON) {
            current = productJSON.quantity;
        }
    }

    if (current >= quantity) {
        if (productQuantityNode) {
            productQuantityNode.textContent = current - quantity;
            updateInventoryOnServer(new XMLSerializer().serializeToString(xmlInventory));
        } else {
            var productJSON = jsonInventory.products.find(p => p.name === productName);
            productJSON.quantity -= quantity;
            updateInventoryOnServer(JSON.stringify(jsonInventory), false);
        }
        
        if (quantityElement) {
            quantityElement.innerText = current - quantity;
        }

        var cartProduct = cartXmlDoc.querySelector(`product[name='${productName}']`);
        if (cartProduct) {
            var cartQuantity = cartProduct.querySelector('quantity');
            var newQuantity = parseInt(cartQuantity.textContent) + quantity;
            cartQuantity.textContent = newQuantity.toString();

            var totalPrice = cartProduct.querySelector('totalPrice');
            totalPrice.textContent = (newQuantity * price).toFixed(2);
        } else {
            var newProductNode = cartXmlDoc.createElement('product');
            newProductNode.setAttribute('name', productName);

            var quantityNode = cartXmlDoc.createElement('quantity');
            quantityNode.textContent = quantity.toString();
            newProductNode.appendChild(quantityNode);

            var totalPriceNode = cartXmlDoc.createElement('totalPrice');
            totalPriceNode.textContent = (quantity * price).toFixed(2);
            newProductNode.appendChild(totalPriceNode);

            cartXmlDoc.querySelector('cart').appendChild(newProductNode);
        }

        localStorage.setItem('cart', new XMLSerializer().serializeToString(cartXmlDoc));
    } else if (current === 0) {
        alert("Sorry, " + productName + " is out of stock!");
    } else {
        alert("Sorry, your request of " + quantity + " " + productName + " exceeds the current inventory!");
    }
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


