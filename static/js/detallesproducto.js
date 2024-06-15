document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    fetch(`/productos/${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const producto = data.producto;
                document.getElementById('product-name').textContent = producto.nombre;
                document.getElementById('product-image').src = producto.imagen_producto;
                document.getElementById('product-price').textContent = `S/. ${producto.precio}`;
                document.getElementById('old-price').textContent = `S/. ${parseFloat(producto.precio) + 5}`;
                document.getElementById('product-description').textContent = producto.descripcion;
                document.getElementById('product-id').textContent = producto.id;
                document.getElementById('product-category').textContent = producto.categoria;
                document.getElementById('product-stock').textContent = producto.stock;

                const quantityInput = document.getElementById('quantity');
                quantityInput.min = 1;
                quantityInput.max = producto.stock;

                const addToCartButton = document.getElementById('add-to-cart-button');
                addToCartButton.addEventListener('click', function () {
                    const quantity = parseInt(quantityInput.value);
                    if (quantity > producto.stock) {
                        alert('Cantidad excede stock del producto');
                        return;
                    }

                    const existingItem = cart.find(item => item.id === producto.id);
                    if (existingItem) {
                        existingItem.cantidad += quantity;
                    } else {
                        cart.push({ ...producto, cantidad: quantity, stock: producto.stock });
                    }
                    saveCart();
                    alert('Producto agregado al carrito');
                });
            } else {
                alert('Error al cargar detalles del producto.');
            }
        })
        .catch(error => console.error('Error:', error));
});
