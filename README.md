# Resumen Máster IA

Centro de estudio responsive para las asignaturas del Máster en IA.

Incluye:
- Procesamiento del Lenguaje Natural.
- Visión Artificial.
- Técnicas de Aprendizaje Automático.
- Investigación y Gestión de Proyectos en IA.
- Razonamiento y Planificación Automática.
- 60 temas organizados con explicaciones, conceptos esenciales y ejemplos.
- Navegación continua entre tema anterior y siguiente.
- Mapas conceptuales gráficos por tema y por asignatura.
- Fórmulas, código y pequeñas prácticas interactivas cuando aportan al aprendizaje.
- Banco de práctica corregible con explicación conceptual.
- Seguimiento de progreso e intentos mediante PostgreSQL administrado por Y700.

## Privacidad del material

Los documentos originales utilizados para preparar los resúmenes y ejercicios **no forman parte del repositorio, de la imagen Docker ni de los archivos estáticos del sitio**. El repositorio contiene únicamente material de estudio redactado para la aplicación.

Las copias privadas de los documentos originales deben permanecer en almacenamiento local del Y700, fuera de `app/static`, y nunca publicarse desde el servidor web. Las carpetas previstas para material privado están excluidas mediante `.gitignore`.

## Despliegue Y700

El repositorio respeta `y700-app-starter`: `linux/amd64`, runtime `10001:10001`, `/health`, sin puertos del host y PostgreSQL declarado en `y700.deploy.yml`.

URL esperada:

`https://resumen-clases.alexistorreslabs.com`

## Flujo de aprendizaje (2026)

El sitio distingue **marcar como visto** de **recordar sin consultar**. Cada tema incorpora una consigna de recuperación activa, respuesta orientativa, autoevaluación y próxima fecha de repaso (intervalos orientativos, no un diagnóstico de dominio). Incluye panel «Continúa donde lo dejaste», favoritos, notas personales, repaso de errores, navegación y un modo de lectura sin distracciones. El estado se guarda en el navegador y se sincroniza a PostgreSQL cuando está disponible.

Las notas y calendarios de repaso usan el `profile_id` local generado al abrir la web: no hay cuentas ni autenticación. Para cambiar de teléfono o navegador usa **Guardar copia / Restaurar copia** desde el inicio. Evita escribir datos sensibles en las notas; un identificador de perfil no equivale a un mecanismo de seguridad.

Los documentos originales académicos siguen excluidos del repositorio y de los archivos estáticos públicos.

### Criterios de diseño

- **Pruebas sin consultar y recuperación activa**: https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html
- **Repaso espaciado**: https://doi.org/10.1038/s44159-022-00089-1
- **Ejemplos y mapas junto con recuperación**: https://www.learningscientists.org/blog/2016/8/18-1

El mecanismo de planificación de revisiones es deliberadamente sencillo: dificultad alta = siguiente día, dudas = aproximadamente 3 días, buen recuerdo = intervalo creciente. No se presenta como algoritmo clínicamente validado ni garantiza resultados de examen.
