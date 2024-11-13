#Passkeys_application

En el package.json se creó un script que ya compila frontend y backend a la par, si se quisiese ejecutar por separado: 

passkeys_application/passkeys_frontend  ---> ng build --configuration production  (compilar frontend)

passkeys_application/ --> node index.js  (ejecutar Backend)

Se ejecuta en el puerto 3000. 


Para runear en la red local y poder probar la web en distintos dispositivos de la red local sería: 

npm run serve -- --host <TU_IP_LOCAL>

Si no tenemos la posibilidad de cambiar en el index.js la siguiente línea: 

app.listen(process.env.PORT || 3000, '0.0.0.0', ...) por --> app.listen(process.env.PORT || 3000, '<TU_IP_LOCAL>', ...) 

Ejemplo: 

npm run serve -- --host 10.20.27.24

Y desde el móvil ponemos https://10.20.27.24:3000

#Runear al clonarlo: 

npm install

npm start







