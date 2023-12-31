// Function to generate a unique order ID
function generateOrderId() {
  return "ORD" + Date.now().toString(36).toUpperCase();
}

// Function to get the current date and time
function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString();
}

function handleFormSubmission() {
  const customerName = document.getElementById("customer-name").value;
  const phoneNumber = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const orderReceipt = document.getElementById("customer-pay").value;
  const orderId = generateOrderId();
  const orderDate = getCurrentDateTime();

  const newOrder = {
      orderId,
      orderDate,
      customer: {
          customerName,
          phoneNumber,
          address,
      },
      items: orderDetails.cartItems,
      totalPrice: orderDetails.totalPrice,
      orderReceipt,
  };

  const jsonContent = JSON.stringify(newOrder, null, 2);

  const blob = new Blob([jsonContent], { type: "application/json" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "order.json";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  fetch("https://nasi-aj-backend-service.onrender.com/nasi_aj/api/submitOrder", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: jsonContent,
  })
      .then((response) => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }

          return response.json();
      })
      .then((data) => {
          console.log("Order submitted successfully:", data);
          alert("Order completed. Thank you!");
      })
      .catch((error) => {
          console.error("Error submitting order:", error);
          alert("Error submitting order. Please try again.");
      });
}  

const finishBtn = document.getElementById("finish-btn");
finishBtn.addEventListener("click", handleFormSubmission);

function displayOrderDetails(orderDetails) {
  const receiptContainer = document.getElementById("receipt-container");
  receiptContainer.innerHTML = "<h2>Your Order Details:</h2>";

  if (orderDetails && orderDetails.cartItems.length > 0) {
    const ul = document.createElement("ul");

    orderDetails.cartItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.itemName} - RM${item.price.toFixed(2)} x ${
        item.quantity
      } = RM${item.total.toFixed(2)}`;
      ul.appendChild(li);
    });

    receiptContainer.appendChild(ul);

    // Display total price
    receiptContainer.innerHTML += `<p>Total Price: RM${orderDetails.totalPrice}</p>`;
    receiptContainer.innerHTML += "<img style='width: 30%;height: 100%;' src='../assets/qr_mb.jpg' /><img style='width: 30%;height: 100%;' src='../assets/qr_tng.jpg' />";
  } else {
    receiptContainer.innerHTML += "<p>No items in the order.</p>";
  }
}

// Retrieve orderDetails from the query parameter in the URL
const searchParams = new URLSearchParams(window.location.search);
const orderDetailsParam = searchParams.get("orderDetails");
const orderDetails = JSON.parse(orderDetailsParam);

// Call the displayOrderDetails function
displayOrderDetails(orderDetails);
console.log(orderDetails);
