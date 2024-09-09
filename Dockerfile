# Usa una imagen base de Node.js
FROM node:22.8.0

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos necesarios (package.json y package-lock.json) al contenedor
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos de la aplicacióna al contenedor
COPY . .

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 8080

# Define el comando por defecto para ejecutar la aplicación
CMD ["npm", "start"]
