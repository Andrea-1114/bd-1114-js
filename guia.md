# Clase Base de Datos 1114 - Taller práctico

## Qué vas a lograr hoy

Conectar la teoría de bases de datos con JavaScript. Los alumnos pasan de "entender qué es una base de datos" a "usar una base de datos desde su propio código". El puente es JSON, que ya vieron en la clase anterior.

Al final de la práctica, cada alumno debe tener un script que:

1. Toma datos en JSON.
2. Los guarda en una base SQLite.
3. Los consulta con SQL.
4. Devuelve el resultado otra vez como JSON.

Ese ciclo es exactamente lo que hace un backend real.

## Concepto central

JSON y SQLite se complementan, no compiten. Es el error más común en nivel básico: pensar que hay que elegir uno u otro.

| | JSON | SQLite |
|---|---|---|
| Para qué sirve | Representar y transportar datos | Guardar y consultar datos |
| Consulta | No tiene (solo filter manual) | SQL: WHERE, ORDER BY, LIMIT |
| Persistencia | No (se pierde al cerrar) | Sí (archivo en disco) |
| Forma | Objetos y arrays | Tablas, filas y columnas |

La frase que deben llevarse: **JSON representa UN dato, SQLite consulta MUCHOS.** Un programador vive moviendo datos entre ambos.

## El momento de la clase

Todo el taller gira alrededor de un solo ciclo. Cuando lo entiendan, entendieron la clase:

```javascript
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('escuela.db');

// 1) JSON: datos que ya saben manejar
const alumnos = [
  { nombre: 'Ana', seccion: '1114', edad: 19 },
  { nombre: 'Luis', seccion: '1114', edad: 21 },
  { nombre: 'Marta', seccion: '1113', edad: 20 },
];

// 2) JSON -> tabla
db.exec('CREATE TABLE IF NOT EXISTS alumnos (nombre TEXT, seccion TEXT, edad INTEGER)');
const insert = db.prepare('INSERT INTO alumnos VALUES (?, ?, ?)');
for (const a of alumnos) insert.run(a.nombre, a.seccion, a.edad);

// 3) SQL responde
const deLa1114 = db.prepare('SELECT * FROM alumnos WHERE seccion = ? ORDER BY edad').all('1114');

// 4) tabla -> JSON (cierra el círculo)
console.log(JSON.stringify(deLa1114, null, 2));
```

## Estructura de la clase

| Etapa | Qué hacen | Tiempo |
|---|---:|---:|
| 1. Setup | Verificar Node y crear el proyecto | 5 min |
| 2. Repaso JSON | Datos como objetos y arrays, .filter() | 20 min |
| 3. El problema | Límites de JSON: consulta y persistencia | 10 min |
| 4. SQLite entra | CREATE TABLE e INSERT | 30 min |
| 5. Consultas | SELECT, WHERE, ORDER BY, LIMIT | 40 min |
| 6. El puente | tabla -> JSON y JSON -> tabla | 20 min |
| 7. Desafío | Consulta libre que devuelva JSON | 20 min |

## Requisitos

- Node 22.5 o superior. Trae `node:sqlite` incorporado. Verifican con `node --version`.
- Nada más. No hay `npm install`, no hay servidor, no hay base de datos que instalar.

Cada alumno trabaja en su propio computador. El primer paso de la clase es que verifiquen `node --version` y, si no lo tienen (o la versión es más vieja que 22.5.0), lo instalen desde https://nodejs.org (versión LTS, la que dice "Recommended"). Este paso puede llevar unos minutos: ténganlo previsto al inicio de la clase.

Nota técnica: al usar `node:sqlite` aparece un warning "experimental". No es un error. Se explica una vez y se sigue.

## Archivos del taller

| Archivo | Qué es |
|---|---|
| `guia.md` | Esta guía: objetivos, concepto y estructura |
| `paso-a-paso.md` | Guía del alumno con las 7 etapas y código |
| `ejemplo.js` | Script completo y funcional (referencia del profe) |

## Rúbrica de evaluación

| Criterio | Puntaje |
|---|---:|
| JSON cargado correctamente en la base | 20 |
| Tabla creada con tipos correctos | 20 |
| Consultas SELECT funcionando | 25 |
| Ciclo completo JSON -> SQL -> JSON | 20 |
| Explicación oral del concepto (JSON vs SQLite) | 15 |
| Total | 100 |

## Preguntas de cierre

Respondan individualmente:

1. ¿Para qué usamos JSON y para qué usamos SQLite?
2. ¿Qué pasaría si cerramos el programa con los datos solo en JSON?
3. ¿Qué hace `?` dentro de una consulta preparada?
4. ¿Qué diferencia hay entre `.get()`, `.all()` y `.run()`?
5. ¿Dónde viste este ciclo JSON -> base de datos -> JSON en la vida real?

## Conclusión

JSON guarda y transporta. SQLite persiste y consulta. No son rivales: son dos herramientas del mismo trabajo. El día que entiendan cuándo usar cada una y cómo mover datos entre ambas, ya no son principiantes.

Primero se entiende el concepto. Después se programa. Ese orden importa.
