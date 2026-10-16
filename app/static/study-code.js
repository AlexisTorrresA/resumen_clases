window.STUDY_CODE = {
'pln:2': {title:'Tokenización y lematización con spaCy',lang:'Python',why:'Muestra el paso de texto bruto a unidades lingüísticas reutilizables.',code:`import spacy
nlp = spacy.load("es_core_news_sm")
doc = nlp("Los modelos estaban aprendiendo rápidamente.")

for token in doc:
    print(token.text, token.lemma_, token.pos_)`},
'pln:3': {title:'POS tagging y entidades',lang:'Python',why:'POS etiqueta función gramatical; NER detecta entidades del mundo.',code:`doc = nlp("OpenAI abrió una oficina en Santiago.")
print([(t.text, t.pos_) for t in doc])
print([(e.text, e.label_) for e in doc.ents])`},
'pln:7': {title:'Probabilidad de un bigrama',lang:'Python',why:'Un modelo n-grama aproxima la probabilidad de una palabra usando contexto local.',code:`from collections import Counter
pairs = Counter([("yo","estudio"), ("yo","estudio"), ("yo","duermo")])
p_estudio = pairs[("yo","estudio")] / 3
print(p_estudio)`},
'pln:8': {title:'Atención: idea mínima',lang:'Pseudo',why:'La atención compara una consulta con claves y pondera valores.',code:`scores = Q @ K.T / sqrt(d)
weights = softmax(scores)
context = weights @ V`},
'pln:10': {title:'Pipeline de agente conversacional',lang:'Pseudo',why:'Separa percepción, comprensión, decisión y generación.',code:`audio -> ASR -> texto
texto -> NLU -> intención + entidades
estado + intención -> gestor_dialogo -> acción
acción -> NLG -> respuesta
respuesta -> TTS -> audio`},
'taa:3': {title:'Evitar data leakage con Pipeline',lang:'Python',why:'El escalado se ajusta solo dentro de cada fold de entrenamiento.',code:`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
model = make_pipeline(StandardScaler(), SVC())
model.fit(X_train, y_train)
print(model.score(X_test, y_test))`},
'taa:4': {title:'Métricas de regresión',lang:'Python',why:'Permite comparar MAE, MSE, RMSE y R² sobre las mismas predicciones.',code:`from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
mae = mean_absolute_error(y, pred)
mse = mean_squared_error(y, pred)
rmse = mse ** 0.5
r2 = r2_score(y, pred)`},
'taa:5': {title:'Matriz de confusión',lang:'Python',why:'Las métricas de clasificación salen de TP, FP, TN y FN.',code:`from sklearn.metrics import confusion_matrix
tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
precision = tp / (tp + fp)
recall = tp / (tp + fn)`},
'taa:6': {title:'Árbol con control de complejidad',lang:'Python',why:'max_depth limita el crecimiento para reducir sobreajuste.',code:`from sklearn.tree import DecisionTreeClassifier
tree = DecisionTreeClassifier(max_depth=4, min_samples_leaf=10)
tree.fit(X_train, y_train)`},
'taa:7': {title:'SVM con kernel RBF',lang:'Python',why:'C y gamma controlan la frontera y el compromiso de generalización.',code:`from sklearn.svm import SVC
model = SVC(C=10, gamma="scale", kernel="rbf")
model.fit(X_train, y_train)`},
'taa:8': {title:'Naïve Bayes',lang:'Python',why:'Es una implementación directa de un clasificador probabilístico.',code:`from sklearn.naive_bayes import GaussianNB
model = GaussianNB()
model.fit(X_train, y_train)
pred = model.predict(X_test)`},
'taa:10': {title:'Random Forest',lang:'Python',why:'Combina muchos árboles y aleatoriedad de variables.',code:`from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=300,max_features="sqrt",oob_score=True,random_state=42)
rf.fit(X_train, y_train)`},
'taa:11': {title:'Grid search con CV',lang:'Python',why:'Selecciona hiperparámetros sin tocar el test final.',code:`from sklearn.model_selection import GridSearchCV
grid = {"svc__C":[0.1,1,10], "svc__gamma":["scale",0.01]}
search = GridSearchCV(model, grid, cv=5, scoring="f1")
search.fit(X_train, y_train)`},
'va:3': {title:'Muestreo de una señal',lang:'Python',why:'Visualiza cómo una señal continua se representa por muestras discretas.',code:`import numpy as np
fs = 100
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*10*t)`},
'va:6': {title:'Corrección gamma',lang:'Python',why:'La transformación punto a punto modifica cada intensidad independientemente.',code:`import numpy as np
img01 = img.astype(float) / 255
gamma = 0.6
out = np.power(img01, gamma)`},
'va:7': {title:'Convolución 2D conceptual',lang:'Python',why:'Cada salida es una suma ponderada de una vecindad.',code:`import numpy as np
patch = np.array([[1,2,1],[2,4,2],[1,2,1]])
kernel = np.ones((3,3)) / 9
value = np.sum(patch * kernel)`},
'va:8': {title:'Espectro con FFT',lang:'Python',why:'Permite observar energía por frecuencia y diseñar filtros.',code:`F = np.fft.fftshift(np.fft.fft2(img))
magnitude = np.log1p(np.abs(F))`},
'va:9': {title:'Apertura morfológica',lang:'Python/OpenCV',why:'Erosión seguida de dilatación elimina objetos claros pequeños.',code:`import cv2, numpy as np
kernel = np.ones((3,3), np.uint8)
opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)`},
'va:12': {title:'Textura con GLCM',lang:'Python',why:'La coocurrencia captura cómo aparecen pares de intensidades.',code:`from skimage.feature import graycomatrix, graycoprops
g = graycomatrix(img, [1], [0], levels=256, symmetric=True)
contrast = graycoprops(g, "contrast")[0,0]`},
'va:13': {title:'Descomposición wavelet',lang:'Python',why:'Separa señal en aproximación y detalles a distintas escalas.',code:`import pywt
cA, (cH, cV, cD) = pywt.dwt2(img, "haar")`},
'igpia:2': {title:'Diseño experimental reproducible',lang:'Pseudo',why:'La hipótesis debe traducirse en variables, protocolo y métrica.',code:`pregunta -> hipótesis
datos -> partición fija + semilla
modelo A / modelo B -> mismo protocolo
métrica + intervalo -> comparación
resultado -> discusión -> conclusión`},
'igpia:4': {title:'Separar resultado y discusión',lang:'Plantilla',why:'Evita mezclar lo observado con la interpretación.',code:`RESULTADO: El MAE bajó de 4.8 a 3.9.
DISCUSIÓN: La mejora puede explicarse por...
CONCLUSIÓN: El método B fue superior bajo este protocolo.`},
'igpia:5': {title:'Canvas mínimo de proyecto IA',lang:'JSON',why:'Obliga a conectar negocio, datos, métrica y despliegue.',code:`{
  "problema": "reducir churn",
  "métrica_negocio": "retención",
  "objetivo_ml": "clasificación",
  "datos": ["uso", "pagos"],
  "métrica_modelo": "recall",
  "despliegue": "batch diario"
}`},
'igpia:6': {title:'Ciclo MLOps',lang:'Pseudo',why:'Un proyecto de IA no termina al entrenar.',code:`datos_versionados -> entrenamiento -> validación -> registro_modelo
-> despliegue -> monitorización -> alerta_drift -> reentrenamiento`},
'igpia:11': {title:'Algoritmo genético',lang:'Pseudo',why:'Resume el ciclo población-fitness-selección-variación.',code:`población = inicializar()
while not stop:
    fitness = evaluar(población)
    padres = seleccionar(población, fitness)
    hijos = cruzar(padres)
    población = mutar(hijos)`},
'rpa:3': {title:'Tabla de verdad en Python',lang:'Python',why:'Permite comprobar si una fórmula es siempre verdadera, siempre falsa o contingente.',code:`from itertools import product
for p, q in product([False, True], repeat=2):
    formula = (not p) or q
    print(p, q, formula)`},
'rpa:5': {title:'A*: función de evaluación',lang:'Pseudo',why:'La prioridad combina coste acumulado y estimación restante.',code:`f(n) = g(n) + h(n)
abrir(inicial)
while frontera:
    n = extraer_menor_f()
    if meta(n): return camino(n)
    expandir(n)`},
'rpa:6': {title:'Minimax',lang:'Pseudo',why:'MAX y MIN alternan propagando utilidad desde hojas.',code:`minimax(n, max):
  if hoja(n): return utilidad(n)
  if max: return max(minimax(h, false) for h in hijos(n))
  else: return min(minimax(h, true) for h in hijos(n))`},
'rpa:8': {title:'Acción PDDL',lang:'PDDL',why:'Separa parámetros, precondiciones y efectos.',code:`(:action mover
 :parameters (?r - robot ?a ?b - lugar)
 :precondition (en ?r ?a)
 :effect (and (not (en ?r ?a)) (en ?r ?b)))`},
'rpa:12': {title:'Reparación reactiva',lang:'Pseudo',why:'Busca soportar una precondición abierta con el menor cambio posible.',code:`fallo = detectar_precondición_abierta()
productores = acciones_que_producen(fallo)
elegir productor compatible
insertar antes de la acción afectada
revisar amenazas y restricciones temporales`}
};