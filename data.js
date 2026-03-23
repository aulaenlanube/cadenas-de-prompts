const appsData = [
  {
    id: 'sistema-solar',
    title: 'Sistema solar 3D',
    description: 'Explora y aprende sobre el sistema solar en una experiencia interactiva en 3D.',
    category: 'Biología / Astronomía',
    url: 'https://apps-educativas.com/curso/eso/1/biologia/app/sistema-solar',
    icon: 'globe',
    iconColor: '#61dafb',
    prompts: [
      { id: 1, text: 'Mejora es aspecto gráfico y las animaciones de la app sistema-solar' },
      { id: 2, text: 'El titulo del arriba a la izquierda no lo quiero.\nAñade un cada planeta y el sol un nuevo punto en forma de estrella, ese punto deberá abrir un modal con un video de youtube incrutado de foma original y debe estar relacionado con el planeta en particular o con una temática similar del universo, los videos debes sacarlos siempre del canal: https://www.youtube.com/@kurzgesagt_es' },
      { id: 3, text: 'No se visualiza el reproductor de youtube por algún motivo, además quiero que el modal con el video esté completamente por encima sin que se vean los elementos del sistema solar, para optimizar puedes parar todas las animaciones y así ver el video consumiendo los mínimos recursos posibles' },
      { id: 4, text: 'Sigue sin verse el video, me aparece el siguiente error en el navegador:\nSpecify a Cross-Origin Embedder Policy to prevent this frame from being blocked\nBecause your site has the Cross-Origin Embedder Policy (COEP) enabled, each embedded iframe must also specify this policy. This behavior protects private data from being exposed to untrusted third party sites.\n\nTo solve this, add one of following to the embedded frame’s HTML response header:\n\nCross-Origin-Embedder-Policy: require-corp\nCross-Origin-Embedder-Policy: credentialless (Chrome > 96)\n1 request\nRequest\tParent Frame\tBlocked Resource\n\noHg5SJYRHA0?autoplay=1&rel=0\t\nhttp://localhost:5173/curso/eso/1/biologia/app/sistema-solar\t\nhttps://www.youtube.com/embed/oHg5SJYRHA0?autoplay=1&rel=0\nLearn more: COOP and COEP' },
      { id: 5, text: 'En la app del sistema solar quiero hacer varias modificaciones:\n*No se debe configurar el tamaño de los planetas, modifica ese slider por velocidad de rotación del planeta\n*La parte de configuración no queda bien el estilo del slider tan claro\n*Debes poder pulsar sobre el botón "Configuración" y así mostrar/ocultar los controles de las velocidades y demás\n*El espacio del canvas principal del universo debe ocupar el 100% del espacio disponible de la ventana, tanto en vertical como en horizontal' },
      { id: 6, text: 'no veo el botón de configuración, y no ocupa el 100% de la pantalla el universo, para ello debes modificar parte del contenedor externo al igual que en otras apps, para ello debes revisar AppRunnerPage.jsx también y así lo entenderás mejor todo' },
      { id: 7, text: 'Haz las orbitas y los tamaños de los planetas más realistas, aplica la textura del sol y de los anillos de saturno con las texturas disponibles en la carpeta' },
      { id: 8, text: 'Haz las orbitas y los tamaños de los planetas más realistas, aplica la textura del sol y de los anillos de saturno con las texturas disponibles en la carpeta' },
      { id: 9, text: 'La textura de los anillos de saturno no está bien aplicada, revisa bien la forma de aplicarla' },
      { id: 10, text: 'Añade la luna, y responde siempre en español' },
      { id: 11, text: 'No veo la luna' },
      { id: 12, text: 'Sigo sin ver la luna' },
      { id: 13, text: 'No funciona nada, pantalla con el error  solarSystemData.js:158 Uncaught ReferenceError: neptuneTexture is not defined\n    at solarSystemData.js:158:21' },
      { id: 14, text: 'La luna rota super rapido sobre la tierra, no funciona bien' },
      { id: 15, text: 'La linea de la orbita de la luna no está bien, además quiero que rote más poco a poco respecto a la tierra y también quiero poder pulsar sobre ella para verla' },
      { id: 16, text: 'la linea de la orbita de la luna respecto a la tierra no esta bien, la orbita no se debe mover del centro de la tierra en este caso' },
      { id: 17, text: 'Al pulsar sobre la luna también se debe detener para observala mejor como el resto de planetas, y la iluminación también debe ser coherente' },
      { id: 18, text: 'quiero que añadas la opción de acercarse alejarse y que se mantenga en esa escala\nquiero que el mensaje "Haz clic en un planeta para viajar a él" esté en el menú de configuración\nquiero que el menú sea más coherente visualmente con el resto de la app' },
      { id: 19, text: 'El estilo del menú de configuración te he dicho que lo quiero distinto' },
    ]
  },
  {
    id: 'mesa-crafteo',
    title: 'Mesa de crafteo',
    description: 'Aprende los elementos y combinaciones en física como si fuera un juego.',
    category: 'Física',
    url: 'https://apps-educativas.com/curso/eso/1/fisica/app/mesa-crafteo',
    icon: 'lightbulb',
    iconColor: '#fbbf24',
    prompts: []
  },
  {
    id: 'celula-animal',
    title: 'La célula animal',
    description: 'Anatomía y características de la célula animal en profundidad.',
    category: 'Biología',
    url: 'https://apps-educativas.com/curso/eso/1/biologia/app/celula-animal',
    icon: 'dna',
    iconColor: '#f43f5e',
    prompts: []
  },
  {
    id: 'celula-vegetal',
    title: 'La Célula vegetal',
    description: 'Descubre las partes y funciones de una célula vegetal con este modelo interactivo.',
    category: 'Biología',
    url: 'https://apps-educativas.com/curso/eso/1/biologia/app/celula-vegetal',
    icon: 'beaker',
    iconColor: '#10b981',
    prompts: []
  }
];

window.appDataList = appsData;
