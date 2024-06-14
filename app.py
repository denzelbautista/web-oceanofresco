# main.py
from flask import Flask, request, jsonify, abort, redirect, url_for
import sys
from database import init_app, db
from config.local import config
from flask import Flask, send_file, render_template
import requests
import json
# flask-login
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
# end flask-login
from models import Usuario, Comentario, Producto, Compra, Suscriptor
from views import views_bp
from users_controller import users_bp

app = Flask(__name__)
init_app(app)

app.config['SECRET_KEY'] = config['SECRET_KEY']

# Configuración de Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'users.login'

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(user_id)

# Para la web

app.register_blueprint(views_bp)
app.register_blueprint(users_bp)

# Para la API

@app.route('/productos', methods=['POST'])
@login_required
def create_producto():
    usuario = current_user
    try:
        nombre = request.form.get('nombre')
        descripcion = request.form.get('descripcion')
        precio = request.form.get('precio')
        categoria = request.form.get('categoria')
        stock = request.form.get('stock')

        # Verifica que los campos obligatorios estén presentes
        if not (nombre and descripcion and precio and categoria and stock):
            return jsonify({'success': False, 'message': 'Campos obligatorios faltantes'}), 400

        # Verifica que se haya subido una imagen
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'Imagen es obligatoria'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No se ha seleccionado ninguna imagen'}), 400

        # Subimos la imagen al servicio de imgBB y obtenemos el nombre del archivo
        response = requests.post(
            'https://api.imgbb.com/1/upload',
            data={'key': '2adc25aee373fb46c2d721f17defe3d4'},  # Reemplaza con tu clave de API de imgBB
            files={'image': file}
        )

        if response.status_code != 200:
            return jsonify({'success': False, 'message': 'Error subiendo la imagen'}), 500

        image_url = response.json()['data']['display_url']

        # Crea un nuevo producto con el user_created_id del token
        nuevo_producto = Producto(
            nombre=nombre, descripcion=descripcion, precio=precio,
            categoria=categoria, stock=stock, vendedor_id=usuario.id, imagen_producto=image_url
        )
        db.session.add(nuevo_producto)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Producto creado correctamente', 'id': nuevo_producto.id}), 201
    except Exception as e:
        print(sys.exc_info())
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Error creando producto'}), 500
    finally:
        db.session.close()

@app.route('/productos', methods=['GET'])
def get_productos():
    try:
        productos = Producto.query.all()
        productos_list = []
        for producto in productos:
            productos_list.append({
                'id': producto.id,
                'nombre': producto.nombre,
                'descripcion': producto.descripcion,
                'precio': producto.precio,
                'categoria': producto.categoria,
                'stock': producto.stock,
                'imagen_producto': producto.imagen_producto  # Asegúrate de que el campo imagen exista y contenga la URL
            })
        return jsonify({'success': True, 'productos': productos_list}), 200
    except Exception as e:
        print(sys.exc_info())
        return jsonify({'success': False, 'message': 'Error obteniendo productos'}), 500

@app.route('/productos/<id>', methods=['GET'])
def get_producto(id):
    try:
        producto = Producto.query.get(id)
        if producto:
            producto_data = {
                'id': producto.id,
                'nombre': producto.nombre,
                'descripcion': producto.descripcion,
                'precio': producto.precio,
                'categoria': producto.categoria,
                'stock': producto.stock,
                'imagen_producto': producto.imagen_producto
            }
            return jsonify({'success': True, 'producto': producto_data}), 200
        else:
            return jsonify({'success': False, 'message': 'Producto no encontrado'}), 404
    except Exception as e:
        print(sys.exc_info())
        return jsonify({'success': False, 'message': 'Error obteniendo producto'}), 500

@app.route('/productos/<producto_id>', methods=['PATCH'])
def update_stock(producto_id):
    producto = Producto.query.get_or_404(producto_id)
    cantidad = request.json.get('cantidad')
    
    if producto.stock >= cantidad:
        producto.stock -= cantidad
        db.session.commit()
        return jsonify({'success': True, 'message': 'Stock actualizado'}), 200
    else:
        return jsonify({'success': False, 'message': 'Stock insuficiente'}), 400

@app.route('/usuario/<product_id>/producto', methods=['GET'])
def get_usuario_by_product_id(product_id):
    try:
        producto = Producto.query.get(product_id)
        if not producto:
            return jsonify({"success": False, "message": "Producto no encontrado"}), 404

        usuario = Usuario.query.get(producto.vendedor_id)
        if not usuario:
            return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

        return jsonify({
            "success": True,
            "usuario": {
                "nombre": usuario.nombre,
                "telefono": usuario.telefono
            }
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/compras', methods=['POST'])
def registrar_compra():
    data = request.json
    dni_usuario = data['dni_usuario']
    productos = data['productos']  # Lista de productos comprados
    monto = data['monto']

    compra = Compra(
        dni_usuario=dni_usuario,
        productos=','.join(map(str, productos)),
        monto=monto
    )
    db.session.add(compra)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Compra registrada'}), 201


@app.route('/agregar_correo', methods=['POST'])
def agregar_correo():
    correo = request.form['correo']
    suscriptor_existente = Suscriptor.query.filter_by(email=correo).first()
    if not suscriptor_existente:
        nuevo_suscriptor = Suscriptor(email=correo)
        db.session.add(nuevo_suscriptor)
        db.session.commit()
        return jsonify({"mensaje": "Correo agregado exitosamente"}), 200
    else:
        # Si el correo ya existe, simplemente devuelve una respuesta exitosa.
        return jsonify({"mensaje": "Correo ya existente, no se realizó ninguna acción"}), 200
    
@app.route('/obtener_correos/12457', methods=['GET'])
def obtener_correos():
    suscriptores = Suscriptor.query.all()
    correos = [suscriptor.email for suscriptor in suscriptores]
    return jsonify({"correos": correos}), 200


if __name__ == '__main__':
    app.run(debug=True)

