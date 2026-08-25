# Base de Datos 1114 - Paso a paso

Vas a construir un solo archivo, `escuela.js`, etapa por etapa. No copies sin entender: cada bloque hace una cosa concreta. Si algo no te cierra, pregunta ANTES de seguir.

## Etapa 0 - Verificar Node

Cada uno trabaja en su propio computador, así que lo primero es saber si tienes Node.

Abre la terminal y ejecuta:

```bash
node --version
```

Debe devolver `v22.5.0` o superior.

Si dice "comando no encontrado", un número menor a `22.5.0`, o directamente no sale nada, tienes que instalarlo:

1. Entra a https://nodejs.org
2. Descarga la versión LTS (la que dice "Recommended")
3. Instálala con doble clic (todo "Siguiente")
4. Cierra la terminal y ábrela de nuevo
5. Verifica otra vez con `node --version`

Cuando ya tengas Node, crea una carpeta para el taller y ubícate adentro:

```bash
mkdir base-datos-1114
cd base-datos-1114
```

## Etapa 1 - Repaso de JSON

Crea el archivo `escuela.js` y pega esto:

```javascript
const alumnos = [
  { nombre: 'Ana', seccion: '1114', edad: 19 },
  { nombre: 'Luis', seccion: '1114', edad: 21 },
  { nombre: 'Marta', seccion: '1113', edad: 20 },
  { nombre: 'Pedro', seccion: '1114', edad: 18 },
];

const deLa1114 = alumnos.filter(a => a.seccion === '1114');
console.log('Alumnos de 1114:', deLa1114);

const mayores = alumnos.filter(a => a.edad >= 20);
console.log('Mayores de 20:', mayores);
```

Ejecuta con:

```bash
node escuela.js
```

Esto ya lo sabes de la clase pasada: JSON es un array de objetos. `filter` devuelve una lista nueva.

## Etapa 2 - El problema

JSON funciona, pero tiene dos límites. Agrega esto al final de `escuela.js`:

```javascript
const resultado = alumnos
  .filter(a => a.seccion === '1114')
  .filter(a => a.edad >= 19)
  .filter(a => a.nombre.length > 3)
  .sort((a, b) => a.edad - b.edad);

console.log('Consulta con filtros:', resultado);
```

Preguntas:

1. ¿Qué pasa con este código si necesito 5 filtros? ¿Y si necesito 10?
2. Si cierro el programa, ¿dónde quedaron los datos?

Respuesta corta: JSON **no consulta** (solo filtra a mano) y **no persiste** (se pierde al cerrar). Para eso existe SQLite.

## Etapa 3 - SQLite entra

Borra el contenido de `escuela.js` y empieza de nuevo. Primero, pedimos el módulo:

```javascript
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('escuela.db');
```

Esa línea abre (o crea) un archivo llamado `escuela.db`. Ahí van a vivir los datos para siempre.

Ahora creamos la tabla y cargamos datos:

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS alumnos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    seccion TEXT NOT NULL,
    edad INTEGER
  )
`);

const alumnos = [
  { nombre: 'Ana', seccion: '1114', edad: 19 },
  { nombre: 'Luis', seccion: '1114', edad: 21 },
  { nombre: 'Marta', seccion: '1113', edad: 20 },
  { nombre: 'Pedro', seccion: '1114', edad: 18 },
];

const insert = db.prepare('INSERT INTO alumnos (nombre, seccion, edad) VALUES (?, ?, ?)');
for (const a of alumnos) {
  insert.run(a.nombre, a.seccion, a.edad);
}

console.log('Datos cargados en escuela.db');
```

Fíjate dos cosas:

- `?` es un comodín. `run` lo reemplaza por el valor que le pases, en orden. Así evitamos meter datos a mano en el SQL.
- `id INTEGER PRIMARY KEY` le da a cada alumno un número único automático.

Ejecuta con `node escuela.js`. Si lo ejecutas dos veces, se duplican los datos. Eso es normal: estamos insertando, no reemplazando. Más adelante lo arreglamos.

## Etapa 4 - Consultas con SELECT

Agrega al final de `escuela.js`:

```javascript
const selSeccion = db.prepare('SELECT * FROM alumnos WHERE seccion = ?');
console.log('Alumnos de 1114:', selSeccion.all('1114'));

const selMayores = db.prepare('SELECT nombre, edad FROM alumnos WHERE edad >= ? ORDER BY edad');
console.log('Mayores de 20:', selMayores.all(20));

const selPrimero = db.prepare('SELECT * FROM alumnos ORDER BY edad DESC LIMIT 1');
console.log('El más grande:', selPrimero.get());

const selCuenta = db.prepare('SELECT COUNT(*) AS total FROM alumnos');
console.log('Total de alumnos:', selCuenta.get());
```

Compara esto con el `filter` de la Etapa 1. Es lo mismo, pero:

- El SQL se lee como una pregunta en inglés ("trae los alumnos donde la sección sea 1114").
- Los datos viven en disco, no en memoria.

Tres métodos que tienes que distinguir:

| Método | Devuelve |
|---|---|
| `.run()` | Resultado de insertar/actualizar/borrar (cuántos cambios) |
| `.get()` | La primera fila que coincide (un solo objeto) |
| `.all()` | Todas las filas que coinciden (un array) |

## Etapa 5 - Modificar y borrar

Agrega:

```javascript
const actualizar = db.prepare('UPDATE alumnos SET edad = ? WHERE nombre = ?');
const cambio = actualizar.run(22, 'Ana');
console.log('Filas actualizadas:', cambio.changes);

const borrar = db.prepare('DELETE FROM alumnos WHERE nombre = ?');
const borrado = borrar.run('Marta');
console.log('Filas borradas:', borrado.changes);
```

Dato importante: `UPDATE` y `DELETE` sin `WHERE` afectan a TODA la tabla. El `WHERE` es tu freno de mano.

## Etapa 6 - El puente JSON <-> SQL

Este es el momento. Cierra el círculo: consulta con SQL y devuelve el resultado como JSON:

```javascript
const rows = selSeccion.all('1114');
const json = JSON.stringify(rows, null, 2);
console.log('Cómo JSON:');
console.log(json);
```

Ahora los datos salen de la base en disco y vuelven al mundo JavaScript como JSON, listos para enviarlos por internet, guardarlos en un archivo o mostrarlos en una pantalla.

## Etapa 7 - Desafío

Agrega dos tablas más: `cursos` y `inscripciones`. La idea: un alumno puede inscribirse a varios cursos.

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS cursos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inscripciones (
    alumno_id INTEGER,
    curso_id INTEGER,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
  )
`);
```

Después carga cursos e inscripciones, y resuelve estas consultas:

1. ¿Qué alumnos se inscribieron a "Base de Datos"?
2. ¿Cuántos cursos tiene cada alumno?

Pista: para la primera necesitas un `JOIN` entre las tres tablas. Para la segunda, `GROUP BY`.

## Entregable

Cada alumno entrega:

1. `escuela.js` completo y funcionando.
2. El archivo `escuela.db` generado.
3. Respuesta escrita a las preguntas de las Etapas 2 y 7.
4. Una frase explicando, con sus palabras, para qué usa JSON y para qué usa SQLite.
