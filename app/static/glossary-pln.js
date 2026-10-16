window.STUDY_GLOSSARY=window.STUDY_GLOSSARY||{};
window.STUDY_GLOSSARY.pln=[
['token','Unidad de texto que procesa el modelo.','Se usa después de segmentar para representar una oración.','“Hola, mundo” puede producir los tokens “Hola”, “,” y “mundo”.'],
['lematización','Reduce una forma flexionada a su lema lingüístico.','Útil para agrupar variantes conservando significado morfológico.','“cantábamos” → “cantar”.'],
['stemming','Recorte heurístico de sufijos o prefijos.','Se usa como normalización rápida cuando no importa obtener una palabra válida.','“naciones” → una raíz aproximada como “nacion”.'],
['HMM','Modelo probabilístico con estados ocultos y observaciones.','En POS tagging, estados=etiquetas y observaciones=palabras.','Calcula transiciones entre etiquetas y emisiones palabra|etiqueta.'],
['Viterbi','Programación dinámica para la secuencia de estados más probable.','Evita enumerar todas las secuencias posibles en HMM.','Escoge la mejor ruta de etiquetas de una oración completa.'],
['CFG','Gramática libre de contexto.','Representa constituyentes con reglas de producción.','S → NP VP.'],
['CKY','Algoritmo de parsing dinámico.','Analiza CFG en forma normal de Chomsky.','Llena una tabla triangular desde spans cortos a largos.'],
['semántica','Representación del significado.','Permite pasar de estructura lingüística a una interpretación útil.','Distinguir quién hizo qué a quién.'],
['polisemia','Una misma forma léxica tiene varios sentidos.','Obliga a usar contexto para desambiguar.','“banco” = asiento o entidad financiera.'],
['WordNet','Recurso léxico organizado por sentidos y relaciones.','Sirve para sinonimia, hiperonimia y similitud semántica.','“perro” es hipónimo de “animal”.'],
['n-grama','Secuencia de n unidades consecutivas.','Modela probabilidad local del lenguaje.','Bigramas usan la palabra anterior para predecir la siguiente.'],
['perplejidad','Medida de incertidumbre de un modelo de lenguaje.','Compara modelos sobre el mismo conjunto/vocabulario; menor suele ser mejor.','Un modelo que asigna más probabilidad al texto tendrá menor perplejidad.'],
['embedding','Vector denso que representa una unidad lingüística.','Permite comparar significado y alimentar redes neuronales.','Palabras semánticamente próximas suelen quedar cerca en el espacio vectorial.'],
['atención','Mecanismo que pondera qué partes de la entrada son relevantes.','Es la base de los Transformers.','Una palabra puede atender a otra distante sin recorrer pasos recurrentes.'],
['Transformer','Arquitectura basada en autoatención y posiciones.','Se usa en traducción, clasificación, generación y LLMs.','BERT y modelos generativos modernos derivan de esta familia.'],
['NER','Reconocimiento de entidades nombradas.','Detecta spans y los clasifica.','“Santiago”→LOC; “OpenAI”→ORG.'],
['ASR','Reconocimiento automático del habla.','Convierte audio a texto antes del procesamiento lingüístico.','Voz del usuario → transcripción.'],
['NLU','Comprensión del lenguaje natural.','Extrae intención, entidades y significado operativo.','“Reserva una mesa mañana” → intención=reservar, fecha=mañana.'],
['NLG','Generación de lenguaje natural.','Construye una respuesta verbal a partir de una decisión o representación.','Datos estructurados → frase comprensible.']
];