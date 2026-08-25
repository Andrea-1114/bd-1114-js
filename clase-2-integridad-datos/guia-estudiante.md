# Clase 2 - Integridad de datos

Hoy vas a pasar de una base de datos que **guarda datos** a una base de datos que **protege datos**. No basta con que un `INSERT` funcione: la base debe rechazar valores incompletos, repetidos, imposibles o sin relación válida.

## Qué vas a lograr

Al terminar podrás:

1. Auditar una tabla antes de cambiarla.
2. Explicar qué problema evita cada restricción.
3. Aplicar `NOT NULL`, `UNIQUE`, `CHECK` y claves foráneas.
4. Activar y comprobar `PRAGMA foreign_keys = ON`.
5. Diseñar pruebas que deben fallar cuando la base está bien protegida.
6. Consultar información relacionada con `JOIN` y resumirla con `GROUP BY`.

## Ruta rápida

Desde la raíz del proyecto:

```bash
node --version
node --experimental-sqlite clase-2-integridad-datos/ejercicio-starter.js
```

Necesitas Node 22.5 o superior. `node:sqlite` ya viene incorporado: no ejecutes `npm install`. El indicador `--experimental-sqlite` es necesario entre Node 22.5 y 22.12, y las versiones más recientes también lo aceptan. Algunas versiones muestran una advertencia de funcionalidad experimental; esa advertencia no significa que el ejercicio falló.

La primera ejecución debe mostrar hallazgos en la auditoría y un resumen de `0/16 en OK`. Eso es intencional: primero observas datos heredados defectuosos y luego compruebas que el esquema inicial todavía acepta datos que no debería aceptar.

## El caso

La escuela guarda estudiantes, cursos e inscripciones. El programa actual funciona, pero permite errores como estos:

- un estudiante sin correo;
- dos estudiantes con el mismo correo;
- una edad negativa;
- una inscripción para un estudiante que no existe.

Una aplicación puede intentar evitar esos errores, pero la última barrera debe estar en la base de datos. Así, la regla se cumple sin importar qué programa escriba los datos.

## Flujo de trabajo

Trabaja en este orden. No agregues restricciones al azar: primero encuentra el riesgo y después define la regla.

1. Ejecuta el starter y conserva la auditoría de los datos heredados.
2. Completa las consultas detalladas de auditoría donde está el primer `TODO`.
3. Lee el esquema nuevo en `crearEsquema()`.
4. Completa los `TODO` de las tablas.
5. Ejecuta de nuevo después de cada cambio.
6. Confirma que el resumen de las pruebas indique `16/16 en OK`.
7. Resuelve el reto final y explica tus decisiones.

El script recrea sus tablas en cada ejecución. Primero carga y audita tablas temporales con datos heredados defectuosos; después las elimina y carga únicamente datos válidos en el esquema nuevo. Por defecto usa `clase-2-integridad-datos/clase-2.db`, no el archivo `escuela.db` de la Clase 1.

## Etapa 1 - Auditar antes de proteger

Una restricción nueva puede fallar si ya existen datos incorrectos. Antes de cambiar el esquema, escribe consultas para responder:

1. ¿Qué estudiantes tienen nombre o correo ausente?
2. ¿Qué correos aparecen más de una vez?
3. ¿Qué edades están ausentes o fuera del rango de 14 a 100 años?
4. ¿Qué cursos no tienen nombre o repiten uno existente?
5. ¿Qué notas están ausentes o fuera del rango de 0 a 5?
6. ¿Qué inscripciones apuntan a estudiantes o cursos inexistentes?
7. ¿Qué parejas estudiante-curso aparecen más de una vez?

Pistas útiles:

```sql
SELECT ... WHERE ... IS NULL OR ... = '';
SELECT ..., COUNT(*) FROM ... GROUP BY ... HAVING COUNT(*) > 1;
```

No tienes que memorizar las consultas. Debes poder explicar qué dato sospechoso busca cada una.

## Etapa 2 - Convertir riesgos en reglas

Completa el esquema del starter con estas decisiones:

| Riesgo | Herramienta | Regla esperada |
|---|---|---|
| Falta un dato obligatorio | `NOT NULL` | El nombre, el correo y los nombres de curso deben existir |
| Se repite una identidad | `UNIQUE` | Dos estudiantes no comparten correo y un curso no repite nombre |
| Un número es imposible | `CHECK` | La edad queda entre 14 y 100; la nota, entre 0 y 5 |
| Una fila apunta a algo inexistente | `FOREIGN KEY` | Toda inscripción referencia un estudiante y un curso reales |
| Se repite la misma inscripción | Restricción compuesta | Una pareja estudiante-curso aparece una sola vez |

### `NOT NULL`

Úsalo cuando la ausencia de un valor vuelve inútil la fila. No confundas `NULL` con texto vacío: `NOT NULL` rechaza `NULL`, pero no rechaza automáticamente `''`.

### `UNIQUE`

Impide duplicados en una columna o combinación de columnas. Una llave primaria ya es única; no necesitas repetir la misma regla.

### `CHECK`

Expresa una condición que cada fila debe cumplir. Define el rango según el problema, no según el tipo de dato: `INTEGER` por sí solo no impide una edad de `-8`.

### Claves foráneas

La declaración `FOREIGN KEY` conecta tablas, pero en SQLite también debes activar su validación en cada conexión:

```javascript
db.exec('PRAGMA foreign_keys = ON');
```

El starter ya activa el `PRAGMA`. Tu trabajo es declarar las relaciones correctas en `inscripciones` y comprobar que estén activas. Puedes consultar:

```sql
PRAGMA foreign_keys;
```

El resultado esperado es `1`.

## Etapa 3 - Pruebas que deben fallar

En este ejercicio, recibir un error puede ser una buena noticia. Cada prueba intenta guardar un dato inválido y revierte el intento para no contaminar la base.

Cuando el esquema esté completo, estas dieciséis acciones deben ser rechazadas:

1. Insertar un estudiante con nombre `NULL`.
2. Insertar un estudiante con correo `NULL`.
3. Repetir el correo de un estudiante existente.
4. Insertar una edad `NULL`, menor que 14 o mayor que 100.
5. Insertar un curso con nombre `NULL` o repetido.
6. Crear una inscripción sin estudiante, sin curso o sin nota.
7. Insertar una nota menor que 0 o mayor que 5.
8. Referenciar un estudiante inexistente o un curso inexistente.
9. Repetir una pareja estudiante-curso existente.

La salida correcta debe terminar con `Resultado: 16/16 en OK`. Si aparece `PENDIENTE`, no escondas el mensaje: identifica qué regla falta.

También realiza dos pruebas válidas creadas por ti. Una base confiable debe rechazar lo incorrecto **y aceptar lo correcto**.

## Etapa 4 - Reto final

Completa `consultaFinal` para producir una fila por curso con:

- el nombre del curso;
- la cantidad de estudiantes inscritos;
- el promedio de las notas, con el alias `promedio`;
- cursos sin inscripciones incluidos;
- resultados ordenados desde el mayor promedio hasta el menor.

Condiciones:

1. Usa al menos un `JOIN`.
2. Usa `GROUP BY`.
3. No cuentes una inscripción inexistente ni inventes notas.
4. Explica por qué un tipo de `JOIN` permite conservar cursos sin estudiantes.

El repositorio no contiene la consulta terminada. Construye y verifica cada parte.

## Entregable

Entrega:

1. `ejercicio-starter.js` completado, con todos los `TODO` resueltos.
2. Una captura o copia de la salida con el resultado `16/16 en OK`.
3. Las siete consultas de auditoría y una frase sobre qué detecta cada una.
4. La consulta final y su resultado.
5. Una explicación de máximo cinco líneas: ¿por qué una base con restricciones es más confiable que una que solo depende de validaciones en JavaScript?

No entregues el archivo `.db`: debe poder recrearse al ejecutar tu JavaScript.

## Rúbrica

| Criterio | Puntaje |
|---|---:|
| Auditoría identifica datos nulos, duplicados, rangos inválidos y relaciones rotas | 20 |
| `NOT NULL`, `UNIQUE` y `CHECK` representan correctamente las reglas | 25 |
| Claves foráneas declaradas y `PRAGMA foreign_keys` comprobado | 20 |
| Dieciséis fallos deliberados rechazados y dos casos válidos aceptados | 15 |
| Reto con `JOIN` y `GROUP BY`, incluidos cursos sin inscripciones | 15 |
| Explicación clara con palabras propias | 5 |
| **Total** | **100** |

## Lista de comprobación

- [ ] Puedo explicar cada restricción que agregué.
- [ ] El resumen de las pruebas inválidas muestra `16/16 en OK`.
- [ ] Mis dos pruebas válidas sí se guardan.
- [ ] `PRAGMA foreign_keys` devuelve `1`.
- [ ] La consulta final incluye todos los cursos.
- [ ] No copié una solución que no puedo explicar.
