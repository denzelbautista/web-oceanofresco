document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Cargar datos del producto
    async function loadProductData() {
        try {
            const response = await fetch(`/productos/${productId}`);
            const data = await response.json();
            if (data.success) {
                const producto = data.producto;
                document.getElementById("nombre").value = producto.nombre;
                document.getElementById("descripcion").value = producto.descripcion;
                document.getElementById("precio").value = producto.precio;
                document.getElementById("stock").value = producto.stock;
                document.getElementById("categoria").value = producto.categoria;
                document.getElementById("product-name").textContent = producto.nombre;
                document.getElementById("product-image").src = producto.imagen_producto;
            } else {
                console.error("Error al cargar los datos del producto:", data.error);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    }

    // Manejar la actualización del producto
    document.getElementById("edit-product-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = {
            nombre: document.getElementById("nombre").value,
            descripcion: document.getElementById("descripcion").value,
            precio: document.getElementById("precio").value,
            stock: document.getElementById("stock").value,
            categoria: document.getElementById("categoria").value
        };

        try {
            const response = await fetch(`/productos2/${productId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                document.getElementById("alert").classList.add("alert-success");
                document.getElementById("alert").textContent = "Producto actualizado correctamente";
                document.getElementById("alert").style.display = "block";
            } else {
                document.getElementById("alert").classList.add("alert-danger");
                document.getElementById("alert").textContent = "Error al actualizar el producto: " + data.error;
                document.getElementById("alert").style.display = "block";
            }
        } catch (error) {
            document.getElementById("alert").classList.add("alert-danger");
            document.getElementById("alert").textContent = "Error de red: " + error;
            document.getElementById("alert").style.display = "block";
        }
    });

    // Incrementar y decrementar stock
    document.getElementById("increase-stock").addEventListener("click", function () {
        let stock = parseInt(document.getElementById("stock").value);
        document.getElementById("stock").value = stock + 1;
    });

    document.getElementById("decrease-stock").addEventListener("click", function () {
        let stock = parseInt(document.getElementById("stock").value);
        if (stock > 0) {
            document.getElementById("stock").value = stock - 1;
        }
    });

    loadProductData();
});
