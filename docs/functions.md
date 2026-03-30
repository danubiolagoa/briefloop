# Catalogo de Funcoes

## Paginas

- `/`: entrada do produto e escolha de fluxo
- `/debrief`: registro guiado de campanhas
- `/brief`: geracao de brief com historico e presets
- `/biblioteca`: consulta de campanhas registradas

## APIs

- `POST /api/generate-debrief`: gera e salva debriefing
- `POST /api/generate-brief`: gera e salva brief
- `POST /api/presets`: salva preset global compartilhado

## Componentes principais

- `DebreifForm`: captura guiada de aprendizado de campanha
- `BriefForm`: captura guiada de requisitos de brief
- `PresetPicker`: aplica modelos globais
- `ActivePresetSummary`: mostra o preset aplicado
- `ChipGroup`: interface de marcacao rapida
- `CollapsibleSection`: organiza campos avancados
- `DebriefCard`: mostra campanhas na biblioteca
- `ResultCard`: mostra resultados gerados pela IA

## Funcoes de dominio

- composicao de texto a partir de selecoes + texto livre
- busca de campanhas similares para enriquecer o brief
- armazenamento de presets globais reutilizaveis
- persistencia de resultados gerados
