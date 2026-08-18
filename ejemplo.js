// Ejemplo completo del taller Base de Datos 1114.
// Recorre el ciclo entero: JSON -> tabla -> consulta -> JSON.
// Requiere Node 22.5 o superior (usa node:sqlite incorporado).

const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('escuela.db');

// Limpiar tablas para que el ejemplo sea repetible.
db.exec('DROP TABLE IF EXISTS inscripciones');
db.exec('DROP TABLE IF EXISTS cursos');
db.exec('DROP TABLE IF EXISTS alumnos');

// ---------------------------------------------------------------------------
// 1) JSON: los datos de arranque, como en la clase pasada.
// ---------------------------------------------------------------------------
const alumnos = [
  { nombre: 'Ana', seccion: '1114', edad: 19 },
  { nombre: 'Luis', seccion: '1114', edad: 21 },
  { nombre: 'Marta', seccion: '1113', edad: 20 },
  { nombre: 'Pedro', seccion: '1114', edad: 18 },
];

// ---------------------------------------------------------------------------
// 2) JSON -> tablas.
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE alumnos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    seccion TEXT NOT NULL,
    edad INTEGER
  )
`);

db.exec(`
  CREATE TABLE cursos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE inscripciones (
    alumno_id INTEGER,
    curso_id INTEGER,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
  )
`);

const insertAlumno = db.prepare('INSERT INTO alumnos (nombre, seccion, edad) VALUES (?, ?, ?)');
const idPorNombre = new Map();

for (const a of alumnos) {
  const res = insertAlumno.run(a.nombre, a.seccion, a.edad);
  idPorNombre.set(a.nombre, Number(res.lastInsertRowid));
}

const insertCurso = db.prepare('INSERT INTO cursos (nombre) VALUES (?)');
const idCurso = new Map();

for (const nombre of ['Base de Datos', 'Programacion', 'Matematica']) {
  const res = insertCurso.run(nombre);
  idCurso.set(nombre, Number(res.lastInsertRowid));
}

const insertInscripcion = db.prepare('INSERT INTO inscripciones (alumno_id, curso_id) VALUES (?, ?)');

insertInscripcion.run(idPorNombre.get('Ana'), idCurso.get('Base de Datos'));
insertInscripcion.run(idPorNombre.get('Ana'), idCurso.get('Programacion'));
insertInscripcion.run(idPorNombre.get('Luis'), idCurso.get('Base de Datos'));
insertInscripcion.run(idPorNombre.get('Pedro'), idCurso.get('Base de Datos'));
insertInscripcion.run(idPorNombre.get('Marta'), idCurso.get('Matematica'));

// ---------------------------------------------------------------------------
// 3) SQL responde.
// ---------------------------------------------------------------------------
const selSeccion = db.prepare('SELECT * FROM alumnos WHERE seccion = ? ORDER BY edad');
console.log('Alumnos de 1114:', selSeccion.all('1114'));

const selMayores = db.prepare('SELECT nombre, edad FROM alumnos WHERE edad >= ? ORDER BY edad');
console.log('Mayores de 20:', selMayores.all(20));

const selPrimero = db.prepare('SELECT * FROM alumnos ORDER BY edad DESC LIMIT 1');
console.log('El mas grande:', selPrimero.get());

const selCuenta = db.prepare('SELECT COUNT(*) AS total FROM alumnos');
console.log('Total de alumnos:', selCuenta.get());

// JOIN: que alumnos se inscribieron a "Base de Datos".
const selInscritos = db.prepare(`
  SELECT a.nombre, a.seccion
  FROM alumnos a
  JOIN inscripciones i ON i.alumno_id = a.id
  JOIN cursos c ON c.id = i.curso_id
  WHERE c.nombre = ?
  ORDER BY a.nombre
`);
console.log('Inscriptos a Base de Datos:', selInscritos.all('Base de Datos'));

// GROUP BY: cuantos cursos tiene cada alumno.
const selPorAlumno = db.prepare(`
  SELECT a.nombre, COUNT(i.curso_id) AS cursos
  FROM alumnos a
  LEFT JOIN inscripciones i ON i.alumno_id = a.id
  GROUP BY a.id
  ORDER BY cursos DESC
`);
console.log('Cursos por alumno:', selPorAlumno.all());

// ---------------------------------------------------------------------------
// 4) tabla -> JSON: cierra el circulo.
// ---------------------------------------------------------------------------
const rows = selSeccion.all('1114');
console.log('Como JSON:');
console.log(JSON.stringify(rows, null, 2));

db.close();
