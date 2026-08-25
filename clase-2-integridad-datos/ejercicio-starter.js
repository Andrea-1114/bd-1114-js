// Clase 2: de una base que funciona a una base confiable.
// Ejecuta con: node --experimental-sqlite clase-2-integridad-datos/ejercicio-starter.js
// Requiere Node 22.5+ y no necesita dependencias.

const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = join(__dirname, 'clase-2.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON');

function prepararDatosLegados() {
  db.exec(`
    DROP TABLE IF EXISTS legado_inscripciones;
    DROP TABLE IF EXISTS legado_cursos;
    DROP TABLE IF EXISTS legado_estudiantes;

    CREATE TABLE legado_estudiantes (id INTEGER PRIMARY KEY, nombre TEXT, correo TEXT, edad INTEGER);
    CREATE TABLE legado_cursos (id INTEGER PRIMARY KEY, nombre TEXT);
    CREATE TABLE legado_inscripciones (
      id INTEGER PRIMARY KEY,
      estudiante_id INTEGER,
      curso_id INTEGER,
      nota REAL
    );

    INSERT INTO legado_estudiantes VALUES
      (1, 'Ana Ruiz', 'ana@colegio.edu.co', 17),
      (2, 'Luis Mora', 'ana@colegio.edu.co', 18),
      (3, 'Marta Gil', NULL, 16),
      (4, NULL, 'sin-nombre@colegio.edu.co', -4);
    INSERT INTO legado_cursos VALUES
      (1, 'Base de Datos'), (2, 'Programación'), (3, 'Redes'),
      (4, NULL), (5, 'Redes');
    INSERT INTO legado_inscripciones VALUES
      (1, 1, 1, 4.5), (2, 2, 1, 3.8), (3, 1, 2, 4.2),
      (4, 999, 1, 4.0), (5, 1, 999, 4.0), (6, 1, 1, 6.0),
      (7, 2, 2, NULL);
  `);
}

function mostrarAuditoriaInicial() {
  const contar = (sql) => db.prepare(sql).get().cantidad;

  console.log('Auditoría de datos heredados:');
  console.log('- Estudiantes sin nombre:', contar(`
    SELECT COUNT(*) AS cantidad FROM legado_estudiantes WHERE nombre IS NULL OR TRIM(nombre) = ''
  `));
  console.log('- Estudiantes sin correo:', contar(`
    SELECT COUNT(*) AS cantidad FROM legado_estudiantes WHERE correo IS NULL OR TRIM(correo) = ''
  `));
  console.log('- Correos repetidos:', contar(`
    SELECT COUNT(*) AS cantidad FROM (
      SELECT correo FROM legado_estudiantes WHERE correo IS NOT NULL GROUP BY correo HAVING COUNT(*) > 1
    )
  `));
  console.log('- Edades ausentes o fuera de rango:', contar(`
    SELECT COUNT(*) AS cantidad FROM legado_estudiantes WHERE edad IS NULL OR edad < 14 OR edad > 100
  `));
  console.log('- Cursos sin nombre:', contar(`
    SELECT COUNT(*) AS cantidad FROM legado_cursos WHERE nombre IS NULL OR TRIM(nombre) = ''
  `));
  console.log('- Nombres de curso repetidos:', contar(`
    SELECT COUNT(*) AS cantidad FROM (
      SELECT nombre FROM legado_cursos WHERE nombre IS NOT NULL GROUP BY nombre HAVING COUNT(*) > 1
    )
  `));
  console.log('- Notas ausentes o fuera de rango:', contar(`
    SELECT COUNT(*) AS cantidad FROM legado_inscripciones WHERE nota IS NULL OR nota < 0 OR nota > 5
  `));
  console.log('- Inscripciones con relaciones rotas:', contar(`
    SELECT COUNT(*) AS cantidad
    FROM legado_inscripciones i
    LEFT JOIN legado_estudiantes e ON e.id = i.estudiante_id
    LEFT JOIN legado_cursos c ON c.id = i.curso_id
    WHERE e.id IS NULL OR c.id IS NULL
  `));
  console.log('- Parejas estudiante-curso repetidas:', contar(`
    SELECT COUNT(*) AS cantidad FROM (
      SELECT estudiante_id, curso_id FROM legado_inscripciones
      GROUP BY estudiante_id, curso_id HAVING COUNT(*) > 1
    )
  `));

  // TODO: escribe consultas que muestren las filas detrás de cada hallazgo.
  db.exec(`
    DROP TABLE legado_inscripciones;
    DROP TABLE legado_cursos;
    DROP TABLE legado_estudiantes;
  `);
}

function crearEsquema() {
  db.exec(`
    DROP TABLE IF EXISTS inscripciones;
    DROP TABLE IF EXISTS cursos;
    DROP TABLE IF EXISTS estudiantes;

    CREATE TABLE estudiantes (
      id INTEGER PRIMARY KEY,
      nombre TEXT,
      correo TEXT,
      edad INTEGER
      -- TODO: protege datos obligatorios, correos repetidos y edades imposibles.
    );

    CREATE TABLE cursos (
      id INTEGER PRIMARY KEY,
      nombre TEXT
      -- TODO: un curso necesita nombre y no debe repetirse.
    );

    CREATE TABLE inscripciones (
      id INTEGER PRIMARY KEY,
      estudiante_id INTEGER,
      curso_id INTEGER,
      nota REAL
      -- TODO: limita la nota, declara las dos claves foráneas y evita
      -- repetir la misma pareja estudiante-curso.
    );
  `);
}

function cargarDatosValidos() {
  const insertarEstudiante = db.prepare(`
    INSERT INTO estudiantes (nombre, correo, edad) VALUES (?, ?, ?)
  `);
  insertarEstudiante.run('Ana Ruiz', 'ana@colegio.edu.co', 17);
  insertarEstudiante.run('Luis Mora', 'luis@colegio.edu.co', 18);
  insertarEstudiante.run('Marta Gil', 'marta@colegio.edu.co', 16);

  const insertarCurso = db.prepare('INSERT INTO cursos (nombre) VALUES (?)');
  insertarCurso.run('Base de Datos');
  insertarCurso.run('Programación');
  insertarCurso.run('Redes');

  const inscribir = db.prepare(`
    INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)
  `);
  inscribir.run(1, 1, 4.5);
  inscribir.run(2, 1, 3.8);
  inscribir.run(1, 2, 4.2);
}

function esperarRechazo(nombre, sql, valores) {
  db.exec('SAVEPOINT prueba_deliberada');

  try {
    db.prepare(sql).run(...valores);
    console.log(`PENDIENTE: la base aceptó ${nombre}`);
    return false;
  } catch (error) {
    console.log(`OK: la base rechazó ${nombre}`);
    return true;
  } finally {
    db.exec('ROLLBACK TO prueba_deliberada');
    db.exec('RELEASE prueba_deliberada');
  }
}

function ejecutarPruebasDeliberadas() {
  console.log('\nPruebas que deben fallar:');

  const pruebas = [
    esperarRechazo(
      'un estudiante sin nombre',
      'INSERT INTO estudiantes (nombre, correo, edad) VALUES (?, ?, ?)',
      [null, 'sin-nombre@colegio.edu.co', 17],
    ),
    esperarRechazo(
      'un correo nulo',
      'INSERT INTO estudiantes (nombre, correo, edad) VALUES (?, ?, ?)',
      ['Elena Paz', null, 17],
    ),
    esperarRechazo(
      'un correo repetido',
      'INSERT INTO estudiantes (nombre, correo, edad) VALUES (?, ?, ?)',
      ['Otra Ana', 'ana@colegio.edu.co', 19],
    ),
    esperarRechazo(
      'una edad nula',
      'INSERT INTO estudiantes (nombre, correo, edad) VALUES (?, ?, ?)',
      ['Mario Sol', 'mario@colegio.edu.co', null],
    ),
    esperarRechazo(
      'una edad menor que 14',
      'INSERT INTO estudiantes (nombre, correo, edad) VALUES (?, ?, ?)',
      ['Mario Sol', 'mario@colegio.edu.co', -4],
    ),
    esperarRechazo(
      'una edad mayor que 100',
      'INSERT INTO estudiantes (nombre, correo, edad) VALUES (?, ?, ?)',
      ['Mario Sol', 'mario@colegio.edu.co', 101],
    ),
    esperarRechazo(
      'un curso sin nombre',
      'INSERT INTO cursos (nombre) VALUES (?)',
      [null],
    ),
    esperarRechazo(
      'un nombre de curso repetido',
      'INSERT INTO cursos (nombre) VALUES (?)',
      ['Redes'],
    ),
    esperarRechazo(
      'una inscripción sin identificador de estudiante',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [null, 1, 4.0],
    ),
    esperarRechazo(
      'una inscripción sin identificador de curso',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [1, null, 4.0],
    ),
    esperarRechazo(
      'una inscripción sin nota',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [1, 3, null],
    ),
    esperarRechazo(
      'una nota fuera de rango',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [1, 3, 6.0],
    ),
    esperarRechazo(
      'una nota menor que cero',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [1, 3, -0.1],
    ),
    esperarRechazo(
      'una inscripción con estudiante inexistente',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [999, 1, 4.0],
    ),
    esperarRechazo(
      'una inscripción sin curso existente',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [1, 999, 4.0],
    ),
    esperarRechazo(
      'una pareja estudiante-curso repetida',
      'INSERT INTO inscripciones (estudiante_id, curso_id, nota) VALUES (?, ?, ?)',
      [1, 1, 4.8],
    ),
  ];

  const aprobadas = pruebas.filter(Boolean).length;
  console.log(`Resultado: ${aprobadas}/${pruebas.length} en OK`);
}

function mostrarEstado() {
  const foreignKeys = db.prepare('PRAGMA foreign_keys').get();
  console.log('Claves foráneas activas (esperado: 1):', foreignKeys.foreign_keys);

  const consultaFinal = `
    -- TODO: una fila por curso con cantidad de estudiantes y promedio de notas.
    -- Debe incluir cursos sin inscripciones y usar JOIN + GROUP BY.
    SELECT 'Completa la consulta final' AS pendiente
  `;
  console.log('\nReto final:', db.prepare(consultaFinal).all());
}

try {
  prepararDatosLegados();
  mostrarAuditoriaInicial();
  crearEsquema();
  cargarDatosValidos();
  mostrarEstado();
  ejecutarPruebasDeliberadas();
} finally {
  db.close();
}
