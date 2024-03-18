// ================================import data from api================================
import { productsData } from "./products.js";

// ================================selected================================
const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backdrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDOM = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total span");
const cartItem = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonsDOM = [];

// ================================class programing================================
// 1. get product
class Products {
  // get from api
  getProducts() {
    return productsData;
  }
}

// 2. display product
class UI {
  displayProducts(products) {
    let result = "";

    products.forEach((item) => {
      result += `
        <div class="product">
            <div class="img-container">
                <img src="${item.imageUrl}" alt="" class="product-img">
            </div>
            <div class="product-desc">
                <p class="product-price">$ ${item.price}</p>
                <p class="product-title">${item.title}</p>
            </div>
            <button class="btn add-to-cart" data-id="${item.id}">
                <i class='bx bxs-cart-alt'></i>
                add to cart
            </button>
        </div>
    `;
      productsDOM.innerHTML = result;
    });
  }

  // btns access in UI after loading products
  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtns;

    addToCartBtns.forEach((btn) => {
      const id = +btn.dataset.id;

      // cheack btns id is in cart or not
      const isInCart = cart.find((p) => p.id === id);
      console.log(isInCart)
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disable = true;
      }

      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        // 1. get product from products
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        // 2. add to cart
        cart = [...cart, addedProduct];
        // 3. save cart to local storage
        Storage.saveCart(cart);
        // 4. update cart values
        this.setCartValue(cart);
        // 5. add to cart modal
        this.addCartItem(addedProduct);
        // 6. get cart from stores
      });
    });
  }

  // total price and cart item
  setCartValue(cart) {
    // 1. cart items
    // 2 cart total price
    let tempCartItem = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItem += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);

    cartTotal.innerHTML = `<span>${totalPrice.toFixed(2)} $</span>`;
    cartItem.innerHTML = `<span>${tempCartItem}</span>`;
  }

  addCartItem(item) {

    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
    <img src="${item.imageUrl}" alt="" class="cart-item-img">
      <div class="cart-item-desc">
           <h4>${item.title}</h4>
          <h5>$ ${item.price}</h5>
      </div>
      <div class="cart-conteoller">
          <i class='bx bxs-chevron-up up' data-id="${item.id}"></i>
          <p>${item.quantity}</p>
          <i class='bx bxs-chevron-down down' data-id="${item.id}"></i>
      </div>
      <i class='bx bxs-trash trash' data-id="${item.id}"></i>
    `
    cartContent.append(div)
  }

  setupApp() {
    // 1. get cart from storage
    cart = Storage.getCart() || [];
    // 2. add cart item
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    // 3. set valus
    this.setCartValue(cart);
  }

  cartLogic() {
    // 1. clear cart
    clearCart.addEventListener("click", () => this.clearCart());

    // 2. cart functionality
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("up")) {
        const addQuantity = e.target;
        // 1. get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id === +addQuantity.dataset.id
        );
        // 2. updat
        addedItem.quantity++;
        this.setCartValue(cart);
        // 3. save cart
        Storage.saveCart(cart);
        // 4. update cart item in UI
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (e.target.classList.contains("trash")) {
        const removeItem = e.target;
        const removedItem = cart.find(
          (cItem) => cItem.id === +removeItem.dataset.id
        );
        this.removeItem(removedItem.id);
        removeItem.parentElement.remove();
        // closeModalFunc()
        // remove from cart item
        // remove
      } else {
        const subQuantity = e.target;

        const removedItem = cart.find(
          (cItem) => cItem.id === +subQuantity.dataset.id
        );

        if (removedItem.quantity <= 1) {
          this.removeItem(removedItem.id);
          subQuantity.parentElement.parentElement.remove();
          // closeModalFunc()
        }

        removedItem.quantity--;
        this.setCartValue(cart);

        Storage.saveCart(cart);

        subQuantity.previousElementSibling.innerText = removedItem.quantity;

      }
    });
  }

  clearCart() {
    cart.forEach((cartItem) => this.removeItem(cartItem.id));
    // console.log(cartContent.children)
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunc();
  }

  removeItem(id) {
    // update cart
    cart = cart.filter((cartItem) => cartItem.id != id);
    // total price and cart item
    this.setCartValue(cart);
    // update storage
    Storage.saveCart(cart);
    // get add to cart btns : chenge text and disable
    this.getSingleButton(id);
  }

  getSingleButton(id) {
    const button = buttonsDOM.find(
      (btn) => btn.dataset.id == parseInt(id) 
    );
    button.innerHTML = `<i class='bx bxs-cart-alt'></i> add to cart`;
    button.disabled = false;
  }
}

// 3. storage
class Storage {
  // when we use static kyework -> do not new Storage
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) =>p.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

// ================================functions================================

// function for open modal
function showModalFunc() {
  cartModal.style.opacity = "1";
  cartModal.style.top = "50%";
  backdrop.style.display = "block";
}

// function for close modal
function closeModalFunc() {
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
  backdrop.style.display = "none";
}

// ================================listeners================================
cartBtn.addEventListener("click", showModalFunc);
backdrop.addEventListener("click", closeModalFunc);
closeModal.addEventListener("click", closeModalFunc);

// ================================when DOM loaded================================
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();

  const ui = new UI();
  ui.displayProducts(productsData);
  ui.setupApp(); //?
  ui.getAddToCartBtns();
  ui.cartLogic();

  Storage.saveProducts(productsData);
});
