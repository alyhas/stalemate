# Design System

This document describes common UI variants used in the project.

## Button variants

| Variant  | Description                         |
|---------|-------------------------------------|
| `primary` | Main action button using `--color-primary`. |
| `secondary` | Neutral button using `--color-secondary`. |
| `success` | Indicates a successful action, using `--color-success`. |
| `warning` | Indicates a warning or destructive action, using `--color-warning`. |
| `icon` | Icon only button with no background. |

## Card variants

| Variant  | Description |
|----------|-------------|
| `default` | Standard card styling. |
| `success` | Card highlighted with `--color-success` border. |
| `warning` | Card highlighted with `--color-warning` border. |

## Timing tokens

Animation timing is standardized using CSS variables defined in `tokens.scss`:

- `--timing-fast` – small quick transitions.
- `--timing-medium` – default transition duration.
- `--timing-slow` – for longer animations.

Components use these tokens for hover and press animations.
