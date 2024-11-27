const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const crearOrganizadorPorDefecto = require('./config/initOrganizador'); // Importa la función

const app = express();

app.use(express.json());
app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://olired2:futbol7@cluster0.qfdl2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('Conexión exitosa a MongoDB Atlas');
        crearOrganizadorPorDefecto(); // Llama a la función de creación del organizador después de conectar a la BD
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB Atlas:', error);
    });

// Sirve archivos estáticos (como CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Usar rutas de autenticación
app.use('/api/usuarios', authRoutes);

// Rutas para servir las páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});
