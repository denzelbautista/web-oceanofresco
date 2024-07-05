document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('misproductos-container');
    const pagination = document.querySelector('.pagination');
    const itemsPerPage = 12;
    let currentPage = 1;
    let productos = [];
    let productoIdToDelete = null;

    function fetchProductos() {
        fetch('/productos_por_usuario')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    productos = data.productos;
                    renderProductos();
                    setupPagination();
                } else {
                    alert('Error al cargar productos.');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function renderProductos() {
        container.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProductos = productos.slice(start, end);

        paginatedProductos.forEach(producto => {
            const productoDiv = document.createElement('div');
            if (producto.stock >= 1) {
                productoDiv.className = 'product-card';

                productoDiv.innerHTML = `
                    <div class="item">
                        <div class="thumb">
                            <img class="product-image" src="${producto.imagen_producto}" alt="${producto.nombre}">
                        </div>
                        <div class="down-content">
                            <span class="product-category">${producto.categoria}</span>
                            <h4 class="product-name">${producto.nombre}</h4>
                            <button class="edit-button" data-id="${producto.id}">Editar</button>
                            <button class="delete-button" data-id="${producto.id}">Eliminar</button>
                        </div>
                    </div>
                `;
                container.appendChild(productoDiv);
            }
        });

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.getAttribute('data-id');
                window.location.href = `/editarproducto?id=${productId}`;
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function () {
                productoIdToDelete = this.getAttribute('data-id');
                showDeleteModal();
            });
        });
    }

    function setupPagination() {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(productos.length / itemsPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = i;
            a.href = '#';
            if (i === currentPage) a.classList.add('is_active');
            a.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = i;
                renderProductos();
                setupPagination();
            });
            li.appendChild(a);
            pagination.appendChild(li);
        }
    }

    function showDeleteModal() {
        const modal = document.getElementById('deleteModal');
        const closeModal = document.querySelector('.close');
        const confirmDelete = document.getElementById('confirmDelete');
        const cancelDelete = document.getElementById('cancelDelete');

        modal.style.display = 'block';

        closeModal.onclick = function () {
            modal.style.display = 'none';
        }

        cancelDelete.onclick = function () {
            modal.style.display = 'none';
        }

        confirmDelete.onclick = function () {
            deleteProducto(productoIdToDelete);
            modal.style.display = 'none';
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }

    function deleteProducto(id) {
        fetch(`/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Producto eliminado correctamente.');
                    fetchProductos();
                } else {
                    alert('Error al eliminar producto.');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    fetchProductos();
});
