document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const alertBox = document.getElementById('alert');

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function renderCart() {
        const cartContainer = document.getElementById('cart-items');
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>El carrito está vacío.</p>';
        } else {
            cart.forEach((item, index) => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';

                cartItemDiv.innerHTML = `
                    <img src="${item.imagen_producto}" alt="${item.nombre}">
                    <div class="cart-item-info">
                        <p>${item.nombre}</p>
                        <p>S/. ${item.precio}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <input type="number" value="${item.cantidad}" min="1" max="${item.stock}" data-index="${index}" placeholder="1">
                        <button class="remove-button" data-index="${index}">Eliminar</button>
                    </div>
                `;
                cartContainer.appendChild(cartItemDiv);
            });
        }
    }

    document.getElementById('cart-items').addEventListener('input', function (event) {
        if (event.target.type === 'number') {
            const index = event.target.getAttribute('data-index');
            const quantity = parseInt(event.target.value);
            if (quantity > 0 && quantity <= cart[index].stock) {
                cart[index].cantidad = quantity;
                saveCart();
                renderCart();
            } else {
                alertBox.style.display = 'block';
                alertBox.classList.remove('alert-success');
                alertBox.classList.add('alert-danger');
                alertBox.innerText = 'Cantidad excede stock del producto';
                event.target.value = cart[index].cantidad;
                setTimeout(() => {
                    alertBox.style.display = 'none';
                }, 1000);
                return;
            }
        }
    });

    document.getElementById('cart-items').addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-button')) {
            const index = event.target.getAttribute('data-index');
            cart.splice(index, 1);
            saveCart();
            renderCart();
        }
    });

    document.getElementById('checkout-button').addEventListener('click', function () {
        window.location.href = '/comprar';
    });

    renderCart();
});
