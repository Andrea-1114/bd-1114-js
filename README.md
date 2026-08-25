# Clase Base de Datos 1114 - Taller práctico

Taller práctico de bases de datos para la sección 1114 (nivel básico). Conecta la teoría de bases de datos con JavaScript usando SQLite y el puente con JSON, que se vio en la clase anterior.

## Qué vas a hacer

Mover datos en un solo ciclo: de JSON a una base de datos, consultarlos con SQL y devolverlos otra vez como JSON. Ese flujo es lo que hace un backend real.

## Requisitos

- Node 22.5 o superior. Trae `node:sqlite` incorporado, no hay que instalar nada más.

Cada alumno trabaja en su propio computador, así que lo primero es verificar que Node esté instalado.

### Verificar si tienes Node

Abre una terminal y ejecuta:

```bash
node --version
```

Debe devolver `v22.5.0` o superior.

### Si no lo tienes (o la versión es más vieja)

1. Entra a https://nodejs.org
2. Descarga la versión LTS (la que dice "Recommended")
3. Instálala con doble clic (todo "Siguiente")
4. Cierra la terminal y ábrela de nuevo
5. Verifica otra vez con `node --version`

## Elige tu clase

### Clase 1 - JSON y SQLite

1. Lee `guia.md` para entender el concepto (JSON vs SQLite).
2. Sigue `paso-a-paso.md` etapa por etapa.
3. Cuando quieras ver el resultado completo, ejecuta:

```bash
node --experimental-sqlite ejemplo.js
```

### Clase 2 - Integridad de datos

Pasa de una base que funciona a una base en la que puedes confiar. Vas a auditar datos, agregar restricciones y comprobar que SQLite rechace información inválida.

Ruta rápida:

1. Abre `clase-2-integridad-datos/guia-estudiante.md`.
2. Ejecuta el punto de partida: `node --experimental-sqlite clase-2-integridad-datos/ejercicio-starter.js`.
3. Completa los `TODO` del starter y repite las pruebas hasta que el resumen indique `16/16 en OK`.
4. Resuelve el reto final con `JOIN` y `GROUP BY` sin buscar una solución completa en este repositorio.

## Qué archivos mirar primero

1. `guia.md`
2. `paso-a-paso.md`
3. `ejemplo.js`
4. `clase-2-integridad-datos/guia-estudiante.md` si vas a realizar la Clase 2

## Qué hace cada parte

### `guia.md`

La guía del taller.

- explica el objetivo y el concepto central
- la estructura de la clase por etapas
- la rúbrica de evaluación y las preguntas de cierre

### `paso-a-paso.md`

La guía del alumno.

- 8 etapas con código, desde el repaso de JSON hasta el desafío con JOIN
- cada etapa explica qué hace el código y por qué

### `ejemplo.js`

Script completo y funcional.

- recorre el ciclo entero: JSON -> tabla -> consulta -> JSON
- incluye las tres tablas (`alumnos`, `cursos`, `inscripciones`) con JOIN y GROUP BY

## Concepto central

JSON y SQLite se complementan, no compiten.

| | JSON | SQLite |
|---|---|---|
| Para qué sirve | Representar y transportar datos | Guardar y consultar datos |
| Consulta | No tiene (solo filter manual) | SQL: WHERE, ORDER BY, LIMIT |
| Persistencia | No (se pierde al cerrar) | Sí (archivo en disco) |

La frase para llevarse: **JSON representa UN dato, SQLite consulta MUCHOS.**

## Créditos

Design by profe Henry by kyrbot.com.
