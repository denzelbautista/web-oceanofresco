document.addEventListener("DOMContentLoaded", function () {
    const editProfileBtn = document.getElementById("edit-profile-btn");
    const profileImageInput = document.getElementById("profile-image-input");
    const profileImageInputContainer = document.getElementById("profile-image-input-container");
    const userImage = document.getElementById("user-image");
    const editableFields = document.querySelectorAll(".editable-fields input, .editable-fields textarea");

    // Función para cambiar la propiedad 'readonly' de los campos editables
    function toggleEditable() {
        editableFields.forEach(field => {
            field.readOnly = !field.readOnly;
        });
    }

    // Función para cambiar el texto del botón de Editar/Guardar
    function toggleButtonText() {
        const isEditing = editProfileBtn.textContent === "Guardar Cambios";
        editProfileBtn.textContent = isEditing ? "Editar Perfil" : "Guardar Cambios";
    }

    // Función para cargar los datos del usuario desde el servidor
    async function loadUserData() {
        try {
            const response = await fetch("/usuarios", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (response.ok) {
                const usuario = data.usuario;
                // Actualizar los campos con los datos del usuario
                document.getElementById("nombre").textContent = usuario.nombre;
                document.getElementById("apellido").textContent = usuario.apellido;
                document.getElementById("email").textContent = usuario.email;
                document.getElementById("nombre-empresa").value = usuario.nombre_empresa || "";
                document.getElementById("telefono").value = usuario.telefono || "";
                document.getElementById("descripcion").value = usuario.descripcion || "";
                userImage.src = usuario.imagen_usuario || "path/to/default-image.jpg";
            } else {
                console.error("Error al cargar los datos del usuario:", data.error);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    }

    // Función para enviar los datos actualizados del perfil al servidor
    async function updateUserData() {
        const formData = new FormData();
        formData.append('nombre_empresa', document.getElementById("nombre-empresa").value);
        formData.append('telefono', document.getElementById("telefono").value);
        formData.append('descripcion', document.getElementById("descripcion").value);
        const imageFile = profileImageInput.files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch("/usuarios", {
                method: "PATCH",
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                console.log("Perfil actualizado exitosamente:", data.message);
                // Volver los campos editables a modo de solo lectura
                toggleEditable();
                // Cambiar el texto del botón de nuevo a "Editar Perfil"
                toggleButtonText();
                // Ocultar el input de subir imagen
                profileImageInputContainer.style.display = "none";
                // Recargar los datos del usuario
                loadUserData();
            } else {
                console.error("Error al actualizar el perfil:", data.error);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    }

    // Manejar el evento click del botón Editar/Guardar
    editProfileBtn.addEventListener("click", function () {
        if (editProfileBtn.textContent === "Editar Perfil") {
            // Cambiar los campos editables a modo de edición
            toggleEditable();
            // Cambiar el texto del botón a "Guardar Cambios"
            toggleButtonText();
            // Mostrar el input de subir imagen
            profileImageInputContainer.style.display = "block";
        } else {
            // Enviar los datos actualizados del perfil al servidor
            updateUserData();
        }
    });

    // Previsualizar la imagen seleccionada antes de enviarla
    profileImageInput.addEventListener("change", function () {
        const file = profileImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                userImage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // Cargar los datos del usuario al cargar la página
    loadUserData();
});
