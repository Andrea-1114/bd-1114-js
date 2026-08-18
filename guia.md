# Clase Base de Datos 1114 - Taller practico

## Que vas a lograr hoy

Conectar la teoria de bases de datos con JavaScript. Los alumnos pasan de "entender que es una base de datos" a "usar una base de datos desde su propio codigo". El puente es JSON, que ya vieron en la clase anterior.

Al final de la practica, cada alumno debe tener un script que:

1. Toma datos en JSON.
2. Los guarda en una base SQLite.
3. Los consulta con SQL.
4. Devuelve el resultado otra vez como JSON.

Ese ciclo es exactamente lo que hace un backend real.

## Concepto central

JSON y SQLite se complementan, no compiten. Es el error mas comun en nivel basico: pensar que hay que elegir uno u otro.

| | JSON | SQLite |
|---|---|---|
| Para que sirve | Representar y transportar datos | Guardar y consultar datos |
| Consulta | No tiene (solo filter manual) | SQL: WHERE, ORDER BY, LIMIT |
| Persistencia | No (se pierde al cerrar) | Si (archivo en disco) |
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

// 4) tabla -> JSON (cierra el circulo)
console.log(JSON.stringify(deLa1114, null, 2));
```

## Estructura de la clase

| Etapa | Que hacen | Tiempo |
|---|---:|---:|
| 1. Setup | Verificar Node y crear el proyecto | 5 min |
| 2. Repaso JSON | Datos como objetos y arrays, .filter() | 20 min |
| 3. El problema | Limites de JSON: consulta y persistencia | 10 min |
| 4. SQLite entra | CREATE TABLE e INSERT | 30 min |
| 5. Consultas | SELECT, WHERE, ORDER BY, LIMIT | 40 min |
| 6. El puente | tabla -> JSON y JSON -> tabla | 20 min |
| 7. Desafio | Consulta libre que devuelva JSON | 20 min |

## Requisitos

- Node 22.5 o superior. Trae `node:sqlite` incorporado. Verifican con `node --version`.
- Nada mas. No hay `npm install`, no hay servidor, no hay base de datos que instalar.

Cada alumno trabaja en su propia maquina. El primer paso de la clase es que verifiquen `node --version` y, si no lo tienen (o la version es mas vieja que 22.5.0), lo instalen desde https://nodejs.org (version LTS, la que dice "Recommended"). Este paso puede llevar unos minutos: tenerlo previsto al inicio de la clase.

Nota tecnica: al usar `node:sqlite` aparece un warning "experimental". No es un error. Se explica una vez y se sigue.

## Archivos del taller

| Archivo | Que es |
|---|---|
| `guia.md` | Esta guia: objetivos, concepto y estructura |
| `paso-a-paso.md` | Guia del alumno con las 7 etapas y codigo |
| `ejemplo.js` | Script completo y funcional (referencia del profe) |

## Rubrica de evaluacion

| Criterio | Puntaje |
|---|---:|
| JSON cargado correctamente en la base | 20 |
| Tabla creada con tipos correctos | 20 |
| Consultas SELECT funcionando | 25 |
| Ciclo completo JSON -> SQL -> JSON | 20 |
| Explicacion oral del concepto (JSON vs SQLite) | 15 |
| Total | 100 |

## Preguntas de cierre

Respondan individualmente:

1. Para que usamos JSON y para que usamos SQLite?
2. Que pasaria si cerramos el programa con los datos solo en JSON?
3. Que hace `?` dentro de una consulta preparada?
4. Que diferencia hay entre `.get()`, `.all()` y `.run()`?
5. Donde viste este ciclo JSON -> base de datos -> JSON en la vida real?

## Conclusion

JSON guarda y transporta. SQLite persiste y consulta. No son rivales: son dos herramientas del mismo trabajo. El dia que entiendan cuando usar cada una y como mover datos entre ambas, ya no son principiantes.

Primero se entiende el concepto. Despues se programa. Ese orden importa.
