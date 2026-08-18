# Clase Base de Datos 1114 - Taller practico

Taller practico de bases de datos para la seccion 1114 (nivel basico). Conecta la teoria de bases de datos con JavaScript usando SQLite y el puente con JSON, que se vio en la clase anterior.

## Que vas a hacer

Mover datos en un solo ciclo: de JSON a una base de datos, consultarlos con SQL y devolverlos otra vez como JSON. Ese flujo es lo que hace un backend real.

## Requisitos

- Node 22.5 o superior. Trae `node:sqlite` incorporado, no hay que instalar nada.

Verifica tu version con:

```bash
node --version
```

## Como empezar

1. Lee `guia.md` para entender el concepto (JSON vs SQLite).
2. Segui `paso-a-paso.md` etapa por etapa.
3. Cuando quieras ver el resultado completo, corre:

```bash
node ejemplo.js
```

## Que archivos mirar primero

1. `guia.md`
2. `paso-a-paso.md`
3. `ejemplo.js`

## Que hace cada parte

### `guia.md`

La guia del taller.

- explica el objetivo y el concepto central
- la estructura de la clase por etapas
- la rubrica de evaluacion y las preguntas de cierre

### `paso-a-paso.md`

La guia del alumno.

- 8 etapas con codigo, desde el repaso de JSON hasta el desafio con JOIN
- cada etapa explica que hace el codigo y por que

### `ejemplo.js`

Script completo y funcional.

- recorre el ciclo entero: JSON -> tabla -> consulta -> JSON
- incluye las tres tablas (`alumnos`, `cursos`, `inscripciones`) con JOIN y GROUP BY

## Concepto central

JSON y SQLite se complementan, no compiten.

| | JSON | SQLite |
|---|---|---|
| Para que sirve | Representar y transportar datos | Guardar y consultar datos |
| Consulta | No tiene (solo filter manual) | SQL: WHERE, ORDER BY, LIMIT |
| Persistencia | No (se pierde al cerrar) | Si (archivo en disco) |

La frase para llevarse: **JSON representa UN dato, SQLite consulta MUCHOS.**

## Creditos

Design by profe Henry by kyrbot.com.
