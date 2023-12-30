import { productsData } from "../data/products.js";

let cartItems = [];
let orderDetails;

function addToCart(itemId, itemName, price, quantity) {
  const existingItem = cartItems.find((item) => item.itemId === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.total =
      parseFloat(existingItem.price) * existingItem.quantity;
  } else {
    const total = parseFloat(price) * parseInt(quantity);
    cartItems.push({
      itemId: itemId,
      itemName: itemName,
      price: price,
      quantity: quantity,
      total: total,
    });
  }
  updateCart();
}

function updateCart() {
  const cartList = document.getElementById("cart-items");
  const totalElement = document.getElementById("total");

  let totalPrice = 0;

  cartList.innerHTML = "";

  cartItems.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <span>${item.itemName} - $${item.price.toFixed(2)} x ${
      item.quantity
    } = $${item.total.toFixed(2)}</span>
        <button class="quantity-btn" data-id="${
          item.itemId
        }" data-action="decrease">Decrease</button>
        <button class="quantity-btn" data-id="${
          item.itemId
        }" data-action="increase">Increase</button>
        <button class="delete-btn" data-id="${item.itemId}">Delete</button>
      `;
    cartList.appendChild(listItem);

    totalPrice += item.total;
  });

  totalElement.textContent = totalPrice.toFixed(2);

  const quantityButtons = document.querySelectorAll(".quantity-btn");
  quantityButtons.forEach((button) => {
    button.addEventListener("click", handleQuantityButtonClick);
  });

  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", handleDeleteButtonClick);
  });
}

function handleQuantityButtonClick(event) {
  const itemId = event.target.getAttribute("data-id");
  const action = event.target.getAttribute("data-action");

  const currentItem = cartItems.find((item) => item.itemId === itemId);

  if (currentItem) {
    if (action === "increase") {
      currentItem.quantity += 1;
    } else if (action === "decrease" && currentItem.quantity > 1) {
      currentItem.quantity -= 1;
    }

    currentItem.total =
      parseFloat(currentItem.price) * currentItem.quantity;
  }

  updateCart();
}

function handleDeleteButtonClick(event) {
  const itemId = event.target.getAttribute("data-id");
  cartItems = cartItems.filter((item) => item.itemId !== itemId);
  updateCart();
}

function clearCart() {
  const checkoutContainer = document.getElementById("cart");

  const checkoutItem = document.createElement("div");
  checkoutItem.className = "checkout";
  checkoutItem.innerHTML = `
    <button class='checkout'>Checkout</button>
      `;

  checkoutContainer.appendChild(checkoutItem);

  const checkoutBtn = checkoutItem.querySelector(".checkout");
  checkoutBtn.addEventListener("click", function () {
    alert("Checkout completed");
    const cartList = document.getElementById("cart-items");
    const totalElement = document.getElementById("total");
    cartList.innerHTML = "";
    orderDetails = {
      cartItems: [...cartItems],
      totalPrice: totalElement.textContent,
    };
    totalElement.textContent = 0;

    cartItems = [];
    updateCart();

    window.location.href = "../html/receipt.html?orderDetails=" + JSON.stringify(orderDetails);
  });
}

function generateMenu() {
  const menuContainer = document.getElementById("menu-content");

  for (const category in productsData) {
    if (productsData.hasOwnProperty(category)) {
      const categoryItems = productsData[category];

      const categoryHeading = document.createElement("h2");
      categoryHeading.textContent =
        category.charAt(0).toUpperCase() + category.slice(1);
      menuContainer.appendChild(categoryHeading);

      const categoryContainer = document.createElement("div");
      categoryContainer.className = "grid_3xn";
      menuContainer.appendChild(categoryContainer);

      categoryItems.forEach((product) => {
        const menuItem = document.createElement("div");
        menuItem.className = "grid_item";
        menuItem.innerHTML = `
          <img src="../assets/menu_ayam_cincang.jpg" />
          <p id="menu_title">${product.itemName}</p>
          <p id="menu_price">RM${product.price.toFixed(2)}</p>

          <label for="quantity-${product.itemId}">Quantity:</label>
          <input type="number" id="quantity-${product.itemId}" name="quantity-${
          product.itemId
        }" min="1" value="1">
          <button class="add-to-cart-btn" data-id="${
            product.itemId
          }" data-name="${product.itemName}" data-price="${
          product.price
        }" id="add_btn">
              Add to Cart
          </button>`;

        categoryContainer.appendChild(menuItem);

        const addToCartBtn = menuItem.querySelector(".add-to-cart-btn");
        addToCartBtn.addEventListener("click", function () {
          const itemId = this.getAttribute("data-id");
          const itemName = this.getAttribute("data-name");
          const price = parseFloat(this.getAttribute("data-price"));
          const quantity = parseInt(
            document.getElementById(`quantity-${itemId}`).value
          );

          addToCart(itemId, itemName, price, quantity);
        });
      });
    }
  }
  clearCart();
  updateCart();
}

generateMenu();
