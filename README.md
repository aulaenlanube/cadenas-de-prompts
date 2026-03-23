# Cadenas de Prompts - Apps Educativas con IA 🚀

Una aplicación web ultraligera diseñada para exponer las secuencias exactas ("cadenas de prompts") que se utilizaron junto con herramientas de Inteligencia Artificial para el desarrollo de diversas aplicaciones educativas de forma autónoma.

El objetivo principal de este recurso es servir como portafolio visual y material didáctico para que **docentes y desarrolladores** puedan observar y analizar el proceso de pensamiento y las instrucciones (prompts) paso a paso, desde los comandos fundacionales hasta los detalles de pulido visual y control de errores.

## 🎯 Aplicaciones Incluidas

Actualmente, el repositorio documenta las interacciones para crear cuatro aplicaciones interactivas orientadas a la ESO:

1. **Sistema solar 3D** (Biología / Astronomía) - *Incluye todas sus 19 cadenas de prompts detalladas.*
2. **Mesa de crafteo** (Física)
3. **La célula animal** (Biología)
4. **La célula vegetal** (Biología)

Cada registro en la aplicación cuenta con un enlace directo ("Probar app") hacia la versión desplegada y en funcionamiento de la aplicación en [apps-educativas.com](https://apps-educativas.com).

## 🛠 Instalación y Uso

Este proyecto ha sido construido utilizando estándares web puros **(Vanilla JS, HTML5, CSS3)**, primando la rapidez, el rendimiento y la facilidad de uso.
**No se necesita Node.js, `npm`, ni compiladores.** 

Para visualizar y probar la aplicación en tu propio equipo, simplemente:

1. Clona o descarga este repositorio.
2. Abre la carpeta `cadenas-de-prompts`.
3. Haz doble clic en el archivo `index.html` para abrirlo directamente en tu navegador habitual.

## ✨ Diseño y UI (Interfaz de Usuario)

La interfaz se ha construido implementando patrones de estética premium:
*   **Glassmorphism:** Paneles de cristal con desenfoque de fondo y bordes pulidos.
*   **Modo Oscuro Elegante:** Fondos profundos integrando un degradado cósmico adaptable.
*   **Micro-interacciones:** Retroalimentación visual interactiva en formato timeline cuando se listan las conversaciones y *hovers* fluidos en elementos.
*   **Iconografía Integrada:** Usando *Lucide Icons* por medio de CDN.
*   **Typografía Moderna:** *Outfit* (Google Fonts) adaptada para la lectura del código y texto.

## 📝 Aportar y Editar 
Para añadir nuevas aplicaciones o prompts, dirígete al archivo `data.js` situado en la raíz y añade un nuevo objeto respetando la misma jerarquía de los datos existentes. El sistema de vista dom de `app.js` lo renderizará automáticamente tras refrescar la página.
