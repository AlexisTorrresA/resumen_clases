window.STUDY_GLOSSARY=window.STUDY_GLOSSARY||{};
window.STUDY_GLOSSARY.rpa=[
['deducción','Razonamiento donde la conclusión se sigue de las premisas si el argumento es válido.','Se formaliza con lógica proposicional o de predicados.','Comprobar validez con tabla de verdad.'],
['tautología','Fórmula verdadera en toda interpretación.','Sirve para reconocer verdades lógicas.','p o no-p.'],
['contingencia','Fórmula verdadera en algunas interpretaciones y falsa en otras.','Indica que no es universalmente verdadera ni falsa.','Una implicación puede depender de la interpretación.'],
['BFS','Búsqueda en amplitud.','Expande por niveles y con costes iguales encuentra el menor número de pasos.','Usa una cola FIFO.'],
['DFS','Búsqueda en profundidad.','Explora una rama antes de retroceder.','Usa una pila LIFO.'],
['coste uniforme','Expande el nodo con menor coste acumulado g.','Es óptima con costes positivos.','Equivale a Dijkstra sobre un espacio de estados.'],
['heurística','Estimación del coste restante.','Guía una búsqueda informada.','Distancia Manhattan.'],
['admisible','Heurística que nunca sobreestima el coste óptimo restante.','Ayuda a mantener la optimalidad de A*.','h(n) no supera el coste real restante.'],
['A*','Búsqueda que usa f=g+h.','Equilibra coste acumulado y estimación restante.','Prioriza el nodo de menor f.'],
['minimax','Decisión adversarial con jugadores MAX y MIN.','Propaga utilidades desde las hojas.','MAX elige el mayor valor y MIN el menor.'],
['alfa-beta','Poda ramas que no pueden cambiar el valor minimax.','Acelera la búsqueda sin cambiar la decisión.','Un buen orden de movimientos aumenta la poda.'],
['precondición','Hecho que debe ser cierto para ejecutar una acción.','Se usa en STRIPS, PDDL y reparación de planes.','Mover requiere estar en el origen.'],
['efecto','Cambio producido por una acción.','Actualiza el estado.','Mover añade estar en destino y elimina estar en origen.'],
['STRIPS','Representación de acciones mediante precondiciones y efectos.','Formaliza planificación clásica.','Una acción indica qué requiere y qué cambia.'],
['PDDL','Lenguaje para describir dominios y problemas de planificación.','Separa acciones generales de objetos, estado inicial y meta.','Un dominio puede reutilizarse en varios problemas.'],
['HTN','Planificación jerárquica por descomposición de tareas.','Reduce el espacio de búsqueda usando conocimiento de dominio.','Preparar viaje se divide en subtareas.'],
['precondición abierta','Condición requerida que todavía no está soportada.','La reparación busca una acción que la produzca.','Falta f3 antes de una acción.'],
['reparación reactiva','Modificación local del plan tras un fallo de ejecución.','Intenta preservar las partes del plan que siguen siendo válidas.','Insertar una acción que regenere un hecho necesario.'],
['restricción temporal','Orden obligatorio entre acciones.','Evita interferencias o consumo prematuro de recursos.','Una acción productora debe ejecutarse antes de la consumidora.']
];