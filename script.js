import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";



const formRegistro = document.getElementById("form-registro");
const inputNombre = document.getElementById("nombre");
const inputCorreo = document.getElementById("correo");
const errorNombre = document.getElementById("error-nombre");
const errorCorreo = document.getElementById("error-correo");
const mensajeRegistro = document.getElementById("mensaje-registro");

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

formRegistro.addEventListener("submit", async function (evento) {
    // Evita que el formulario recargue la página (comportamiento por defecto)
    evento.preventDefault();

    let esValido = true;


    if (inputNombre.value.trim().length < 3) {
        errorNombre.textContent = "El nombre debe tener al menos 3 caracteres.";
        inputNombre.classList.add("invalido");
        esValido = false;
    } else {
        errorNombre.textContent = "";
        inputNombre.classList.remove("invalido");
    }

    if (!regexCorreo.test(inputCorreo.value.trim())) {
        errorCorreo.textContent = "Ingresa un correo electrónico válido.";
        inputCorreo.classList.add("invalido");
        esValido = false;
    } else {
        errorCorreo.textContent = "";
        inputCorreo.classList.remove("invalido");
    }

    //se guarda en Firebase
    if (esValido) {
        mensajeRegistro.textContent = "Guardando...";
        try {
            await guardarUsuario(inputNombre.value.trim(), inputCorreo.value.trim());
            mensajeRegistro.textContent = "¡Registro exitoso! Tus datos fueron guardados en la base de datos.";
            formRegistro.reset();
        } catch (error) {
            console.error("Error al guardar en Firebase:", error);
            mensajeRegistro.textContent = "Ocurrió un error al guardar. Intenta de nuevo.";
        }
    } else {
        mensajeRegistro.textContent = "";
    }
});

async function guardarUsuario(nombre, correo) {
    await addDoc(collection(db, "usuarios"), {
        nombre: nombre,
        correo: correo,
        fecha: serverTimestamp()
    });

    console.log("Usuario guardado en Firebase correctamente");
}


let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const listaCarrito = document.getElementById("lista-carrito");
const carritoVacioMsg = document.getElementById("carrito-vacio");
const totalCarritoSpan = document.getElementById("total-carrito");
const botonesCarrito = document.querySelectorAll(".btn-carrito");

botonesCarrito.forEach(function (boton) {
    boton.addEventListener("click", function () {
        const nombre = boton.getAttribute("data-nombre");
        const precio = parseFloat(boton.getAttribute("data-precio"));

        agregarAlCarrito(nombre, precio);
    });
});

function agregarAlCarrito(nombre, precio) {
    // Revisa si el producto ya está en el carrito para aumentar su cantidad
    const productoExistente = carrito.find(function (item) {
        return item.nombre === nombre;
    });

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
    }

    guardarCarrito();
    renderizarCarrito();
    registrarEventoCarrito("agregar", nombre, precio);
}

function eliminarDelCarrito(nombre) {
    // Filtra el carrito dejando fuera el producto eliminado
    carrito = carrito.filter(function (item) {
        return item.nombre !== nombre;
    });

    guardarCarrito();
    renderizarCarrito();
    registrarEventoCarrito("eliminar", nombre, null);
}

// Registra en Firebase cada interacción relevante del carrito 
async function registrarEventoCarrito(accion, nombreProducto, precio) {
    try {
        await addDoc(collection(db, "carrito_eventos"), {
            accion: accion,
            producto: nombreProducto,
            precio: precio,
            fecha: serverTimestamp()
        });
        console.log("Evento de carrito registrado en Firebase:", accion, nombreProducto);
    } catch (error) {
        console.error("Error al registrar evento del carrito:", error);
    }
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function renderizarCarrito() {

    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        carritoVacioMsg.style.display = "block";
    } else {
        carritoVacioMsg.style.display = "none";
    }

    let total = 0;

    carrito.forEach(function (item) {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const li = document.createElement("li");
        li.innerHTML =
            "<span>" + item.nombre + " x" + item.cantidad + " - $" + subtotal.toFixed(2) + "</span>" +
            "<button class='btn-eliminar'>Eliminar</button>";

        const botonEliminar = li.querySelector(".btn-eliminar");
        botonEliminar.addEventListener("click", function () {
            eliminarDelCarrito(item.nombre);
        });

        listaCarrito.appendChild(li);
    });

    totalCarritoSpan.textContent = "$" + total.toFixed(2);
}

renderizarCarrito();

const btnPagar = document.getElementById("btn-pagar");
const mensajeCompra = document.getElementById("mensaje-compra");

btnPagar.addEventListener("click", async function () {
    if (carrito.length === 0) {
        mensajeCompra.style.color = "#dc2626";
        mensajeCompra.textContent = "Tu carrito está vacío. Agrega productos antes de pagar.";
        return;
    }


    const totalCompra = carrito.reduce(function (acumulado, item) {
        return acumulado + (item.precio * item.cantidad);
    }, 0);

    try {
        await addDoc(collection(db, "compras"), {
            productos: carrito,
            total: totalCompra,
            fecha: serverTimestamp()
        });
        console.log("Compra registrada en Firebase");
    } catch (error) {
        console.error("Error al registrar la compra en Firebase:", error);
    }

    // Vacía el carrito
    carrito = [];
    guardarCarrito();
    renderizarCarrito();

    mensajeCompra.style.color = "#16a34a";
    mensajeCompra.textContent = "¡Compra exitosa! Gracias por tu pedido.";
});