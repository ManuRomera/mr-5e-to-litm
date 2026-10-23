# MR · Conversor D&D 5e → Legend in the Mist

**Versión 0.1.0 beta · Foundry VTT 13/14 · Castellano de España · Manu Romera**

Convierte personajes de D&D 5.ª edición en héroes nativos de **Legend in the Mist** de forma asistida. Conserva su identidad, su pasado y sus capacidades distintivas sin pretender transformar mecánicas de D&D en una equivalencia exacta.

**Descarga para Foundry** (una vez publicado el release automático): 

```text
https://github.com/ManuRomera/mr-5e-to-litm/releases/latest/download/module.json
```

> Beta: las pruebas unitarias verifican el motor puro, pero **no sustituye una prueba completa dentro de una instalación real** de Foundry V13/V14 y del sistema oficial. Revisa cada ficha generada antes de jugar.

## Instalación

Desde Foundry: **Add-on Modules → Install Module → Manifest URL** y pega la dirección anterior cuando aparezca el primer release. Activa el módulo en tu mundo de D&D 5e y/o Legend in the Mist.

Si no hay un release disponible, descarga el código, empaqueta el contenido de `modules/mr-5e-to-litm` como carpeta `mr-5e-to-litm` y cópialo a `FoundryVTT/Data/modules/`.

En Foundry abre **Configuración → Ajustes de módulos → MR · Conversor → Abrir conversor**.

## Funcionamiento

1. En un mundo **D&D 5e** selecciona un actor y pulsa **Exportar actor**. También puedes emplear el JSON nativo exportado por Foundry.
2. En el mundo **Legend in the Mist** abre el conversor y carga el JSON, pégalo o completa el formulario manual.
3. Se generará un **borrador de cuatro Libros de tema** (clase, pueblo, rasgo y magia/trasfondo). Se sugerirán etiquetas a partir de las dotes y conjuros que ya tiene el personaje.
4. Revisa título y **Poderío** de cada libro, etiquetas, debilidad y **Gesta**. No se rellena automáticamente una motivación narrativa inventada.
5. Guarda el borrador o crea un nuevo actor `litm-character` (necesita permiso de Narrador). Los actores originales se conservan.

**Importante:** la guía 5E Crossover Tool de Son of Oak sugiere para cada tema tres etiquetas de poder (incluido el título cuando corresponde), una debilidad y una Gesta. Los conjuros requieren contrastar sus efectos, rutinas y Poderío. Esta herramienta **no convierte automáticamente** todos los poderes y conjuros ni sus consecuencias mecánicas. Los personajes multiclase requieren especial revisión.

## Compatibilidad

- Foundry VTT V13 y V14 (pendiente de validación real de la interfaz).
- `dnd5e` para exportación y `mist-engine-fvtt` para crear el nuevo actor.
- Glosario compatible con [MR · Legend in the Mist en español](https://github.com/ManuRomera/mr-litm-es): **Poderío, Gesta, Libro de tema, Rutina, Etiqueta**, etc.
- JSON nativos de Foundry, exportación propia, algunos campos de D&D Beyond y entrada manual. D&D Beyond está en modo de compatibilidad aproximada.

## Para desarrollo

```bash
node --test tests/core.test.mjs
```

El módulo vive en `modules/mr-5e-to-litm/`. `scripts/core.mjs` no depende de Foundry, lo que permite probar su conversión y validación sin iniciar el VTT.

La acción `.github/workflows/release.yml` comprueba el motor y, tras cada cambio en `main`, genera el ZIP y el manifiesto de la versión 0.1.0. No genera una nueva versión si el release ya existe.

## Derechos

Este proyecto **no incluye los conjuntos traducidos del suplemento** ni ninguna tabla de Rutinas transcrita de la guía. Los ficheros de la beta privada se excluyen de esta versión pública: requieren comprobar los permisos de redistribución. Consulta [DERECHOS.md](DERECHOS.md). El código original se ofrece bajo la licencia MIT.

Proyecto independiente y no oficial; no está afiliado ni respaldado por Son of Oak Game Studio, Wizards of the Coast o Foundry Gaming LLC.
