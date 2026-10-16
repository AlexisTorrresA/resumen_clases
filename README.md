# Resumen de Clases · Máster IA

Sitio de estudio interactivo para organizar asignaturas del Máster en IA por curso y clase.

## Primera asignatura

**Procesamiento del Lenguaje Natural**: 10 temas resumidos desde el material oficial aportado, con:

- resumen por clase;
- conceptos imprescindibles;
- fechas y ejemplos relevantes;
- trampas típicas de examen;
- preguntas rápidas con respuesta;
- resumen global de la asignatura;
- ruta de estudio;
- mapa conceptual interactivo;
- buscador global y progreso local.

## Desarrollo local

```bash
pip install -r requirements.txt httpx pytest
PYTHONPATH=. pytest -q
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Y700

Este repositorio sigue el contrato de `y700-app-starter`:

- imagen `ghcr.io/alexistorrresa/resumen-clases:main`;
- runtime no-root `10001:10001`;
- healthcheck en `/health`;
- sin puertos publicados al host;
- despliegue público esperado en `https://resumen-clases.alexistorreslabs.com`.

Cada `push` a `main` ejecuta tests y publica la imagen `linux/amd64` en GHCR. El Y700 Deployment Manager se encarga de reconciliar el contenedor y Caddy.
