const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando proceso de build...');

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
};

console.log('📁 Verificando configuración de Firebase...');

// Verificar que tenemos todas las variables necesarias
const requiredVars = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingVars = requiredVars.filter(key => !firebaseConfig[key]);

if (missingVars.length > 0) {
    console.error('❌ Faltan variables de Firebase:', missingVars);
    process.exit(1);
}

try {
    // Ruta al archivo de configuración de Firebase
    const configPath = './root/js/firebase-config.js';
    
    console.log('🔧 Leyendo plantilla de configuración...');
    
    // Leer el archivo de configuración de Firebase
    const configTemplate = fs.readFileSync(configPath, 'utf8');

    // Reemplazar placeholders con valores reales
    let configContent = configTemplate;
    Object.keys(firebaseConfig).forEach(key => {
        const placeholder = `{{${key.toUpperCase()}}}`;
        const value = firebaseConfig[key];
        configContent = configContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Escribir el archivo de configuración final
    fs.writeFileSync(configPath, configContent);
    
    console.log('✅ Configuración de Firebase actualizada correctamente!');
    console.log('📊 Variables configuradas:');
    Object.keys(firebaseConfig).forEach(key => {
        const value = firebaseConfig[key];
        console.log(`   ${key}: ${value ? '✅' : '❌'} ${value ? value.substring(0, 10) + '...' : 'FALTANTE'}`);
    });
    
} catch (error) {
    console.error('❌ Error durante el proceso de build:', error.message);
    console.error('   Ruta del error:', error.path);
    process.exit(1);
}

console.log('🎉 Build completado exitosamente!');