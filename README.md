# Eze en 3D

Sitio web estatico simple publicado con GitHub Pages.

## Como esta publicado

- GitHub Pages sirve los archivos HTML, CSS, JS e imagenes directamente desde el repositorio.
- La pagina principal debe existir como `index.html` en la raiz del proyecto.
- Cada pagina interna debe estar en una carpeta con su propio `index.html`.
- Ejemplos de rutas:
  - `/` usa `index.html`.
  - `/calculadora/` usa `calculadora/index.html`.
  - `/contacto/` usa `contacto/index.html`.
- El archivo `CNAME` mantiene el dominio personalizado.
- `sitemap.xml` y `robots.txt` tambien viven en la raiz para que Google los pueda leer.

## Sobre Node

Este proyecto no necesita un build de Node para publicarse en GitHub Pages.

El `package.json` solo tiene un comando de servidor local para probar la web:

```bash
npm run serve
```

Ese comando abre un servidor local, pero no genera la web final. La web final son los archivos estaticos del proyecto, especialmente los `index.html` de la raiz y de cada carpeta.

## Reglas para cambios futuros

- No reemplazar la pagina por una app que dependa de servidor.
- Mantener la home en `index.html`.
- Mantener cada pagina SEO importante como una ruta estatica con su propio `index.html`.
- Si se crea una pagina nueva que debe aparecer en Google, agregarla a `sitemap.xml`.
- Si se cambian valores o contenido de la calculadora, revisar `calculadora/index.html` y `site.js`.
- Mantener `styles.css` como hoja de estilos compartida.
