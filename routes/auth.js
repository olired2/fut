// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Ruta para registrarse
router.post('/registro', async (req, res) => {
    const { email, password, nombre, edad, contacto, experiencia } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear un nuevo usuario
        const newUser = new User({
            email,
            password,  // La contraseña se encriptará automáticamente en el modelo
            role: 'arbitro',
            nombre,
            edad,
            contacto,
            experiencia
        });

        // Guardar el usuario
        await newUser.save();

        res.status(201).json({ message: 'Registro exitoso' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar al usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Comparar la contraseña encriptada con la proporcionada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token JWT
        const token = user.generateAuthToken();

        // Redirigir según el rol
        if (user.role === 'organizador') {
            return res.status(200).json({ message: 'Inicio de sesión exitoso', token, redirect: '/dashboard_organizador.html' });
        } else {
            return res.status(200).json({ message: 'Inicio de sesión exitoso', token, redirect: '/dashboard.html' });
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        res.status(200).json({ message: 'Sesión cerrada con éxito' });
    });
});

// Ruta para obtener el perfil del usuario
router.get('/perfil/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({
            nombre: user.nombre,
            edad: user.edad,
            contacto: user.contacto,
            experiencia: user.experiencia
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta para editar el perfil
router.post('/editar-perfil', async (req, res) => {
    const { email, nombre, edad, contacto, experiencia } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar los campos del usuario
        user.nombre = nombre;
        user.edad = edad;
        user.contacto = contacto;
        user.experiencia = experiencia;

        await user.save();
        res.status(200).json({ message: 'Perfil actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
