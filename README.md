# MR · Conversor D&D 5e → Legend in the Mist

Módulo independiente para Foundry VTT que ayuda a trasladar personajes de D&D 5.ª edición a héroes de **Legend in the Mist**, conservando su identidad narrativa.

**Autor:** Manu Romera · **Idioma:** castellano de España · **Estado:** beta / desarrollo.

El proyecto se integra con el sistema oficial `mist-engine-fvtt` y es compatible con el glosario de [MR · Legend in the Mist en español](https://github.com/ManuRomera/mr-litm-es), sin modificarlo.

## Objetivo
- Importar JSON exportado de actores de D&D 5e y admitir la introducción manual.
- Revisar cuatro libros de tema, etiquetas, debilidades, Gestas y Poderío.
- Crear un nuevo actor nativo `litm-character`, previa validación del Narrador.
- Mantener separados los datos de las fuentes y la adaptación final.

## Alcance y estado
Esta es una herramienta de **conversión asistida**, no una conversión automática exacta de todas las subclases o conjuros. Las etiquetas y técnicas deben revisarse antes de jugar. La aplicación no modifica los personajes originales.

La interfaz y el código fuente se publican aquí. La versión privada de pruebas incluía archivos `kits.json` y `rotes.json` derivados de la guía *5E Crossover Tool* de Son of Oak. **Estos archivos no se incluyen en el repositorio público**, pues la descarga gratuita del suplemento no implica autorización para redistribuir su traducción. Para las opciones de conversión se emplean sugerencias originales y editables.

## Requisitos
Foundry VTT 13 o 14, con el sistema `dnd5e` en el mundo de origen o `mist-engine-fvtt` en el mundo de destino. La integración exacta debe probarse en una instalación real de Foundry.

Proyecto no oficial; sin afiliación con Son of Oak Game Studio, Wizards of the Coast ni Foundry Gaming LLC.

**Nota:** este repositorio se está inicializando. El módulo completo y las instrucciones de instalación se incorporan en los archivos siguientes.