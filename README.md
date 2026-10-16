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
