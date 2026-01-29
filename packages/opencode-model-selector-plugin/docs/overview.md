# OpenCode Model Selector Plugin

Automatically selects the most appropriate models for the current provider in OpenCode.

## Quick Start

```bash
# Install the plugin
opencode plugin add @pantheon-org/opencode-model-selector-plugin

# Select models interactively
/select-model

# List all available models
/list-models

# Configure models directly
/set-models largeProvider=anthropic largeModel=claude-3-5-sonnet-20241022 smallProvider=openai smallModel=gpt-4o-mini
```

## Features

- **🤖 Intelligent Selection**: Auto-categorizes models into large (complex tasks) and small (quick tasks)
- **🔍 Multi-Provider Support**: Anthropic, OpenAI, Google, Ollama, Azure, and custom providers
- **📊 Models.dev Integration**: Comprehensive model database with real-time updates
- **⚡ Smart Caching**: Optimized performance with intelligent cache management
- **🎯 Auto-Setup**: Prompts for model configuration on first session

## Configuration

Plugin settings are stored in `.opencode/plugin.json`:

```json
{
  "@pantheon-org/opencode-model-selector-plugin": {
    "autoPrompt": true,
    "models": {
      "large": { "provider": "anthropic", "model": "claude-3-5-sonnet-20241022" },
      "small": { "provider": "openai", "model": "gpt-4o-mini" }
    }
  }
}
```

## Commands

| Command            | Description                 | Options                                                      |
| ------------------ | --------------------------- | ------------------------------------------------------------ |
| `/select-model`    | Interactive model selection | `provider`, `category`, `auto`                               |
| `/list-models`     | Display available models    | `provider`, `category`, `format`                             |
| `/set-models`      | Direct model configuration  | `largeProvider`, `largeModel`, `smallProvider`, `smallModel` |
| `/discover-models` | Refresh model discovery     | `forceApi`, `provider`                                       |

## Model Classification

### Large Models (Complex Tasks)

- Context window: 100k+ tokens
- Flagship models: GPT-4, Claude 3.5 Sonnet, Gemini Pro
- Advanced capabilities: Vision, tool use, reasoning

### Small Models (Quick Tasks)

- Context window: <100k tokens
- Fast models: GPT-3.5, Claude 3.5 Haiku, Gemini Flash
- Efficient capabilities: Text, code, basic tool use

For complete documentation, see [README.md](./README.md)
