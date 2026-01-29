# OpenCode Model Selector Plugin

Automatically selects the most appropriate models for the current provider in OpenCode.

## Features

### 🤖 Intelligent Model Selection

- **Multi-Provider Support**: Works with Anthropic, OpenAI, Google, Ollama, Azure, and custom providers
- **Smart Categorization**: Automatically classifies models as "large" (complex tasks) or "small" (quick tasks)
- **Models.dev Integration**: Uses comprehensive model database for up-to-date information

### 📋 Model Discovery

- **Configuration Parsing**: Reads from `~/.local/share/opencode/auth.json` → `~/.config/opencode/opencode.json` →
  project `opencode.json`
- **API Discovery**: Calls provider APIs to fetch available models when not configured
- **Fallback Catalogs**: Uses Models.dev database as authoritative source for model information

### 🎯 Two-Model System

- **Large Models**: For complex tasks requiring deep reasoning (GPT-4, Claude 3.5 Sonnet, etc.)
- **Small Models**: For quick tasks and simple operations (GPT-3.5, Claude 3.5 Haiku, etc.)
- **Auto-Prompting**: Offers setup on first session if models aren't configured

### 🛠️ Interactive Commands

- `/select-model` - Interactive model selection with filtering
- `/list-models` - Display all available models with categorization
- `/set-models` - Directly configure large/small model pair
- `/discover-models` - Force refresh model discovery

## Installation

```bash
# Install the plugin
opencode plugin add @pantheon-org/opencode-model-selector-plugin

# Or manually add to your OpenCode configuration
```

## Usage

### Initial Setup

On your first session with the plugin, you'll be prompted to select models:

1. **Auto-Selection**: Plugin recommends optimal large/small model pair
2. **Manual Selection**: Browse and select from all available models
3. **Provider Filtering**: Filter by specific providers if needed

### Commands

#### Select Models Interactively

```bash
/select-model
```

Options:

- `provider?: string` - Filter by provider name
- `category?: "large" | "small"` - Select specific category
- `auto?: boolean` - Auto-select best model

#### List Available Models

```bash
/list-models
```

Options:

- `provider?: string` - Filter by provider
- `category?: "large" | "small"` - Filter by category
- `format?: "table" | "json"` - Output format

#### Direct Model Configuration

```bash
/set-models largeProvider=gpt-4 largeModel=gpt-4-turbo smallProvider=anthropic smallModel=claude-3-haiku
```

#### Force Model Discovery

```bash
/discover-models
```

Options:

- `forceApi?: boolean` - Force API discovery even if cache exists
- `provider?: string` - Discover models for specific provider only

## Configuration

The plugin stores configuration in `.opencode/plugin.json`:

```json
{
  "@pantheon-org/opencode-model-selector-plugin": {
    "autoPrompt": true,
    "models": {
      "large": {
        "provider": "anthropic",
        "model": "claude-3-5-sonnet-20241022"
      },
      "small": {
        "provider": "openai",
        "model": "gpt-4o-mini"
      }
    },
    "classification": {
      "contextThreshold": 100000,
      "preferCostEffective": true,
      "weightContext": 0.3,
      "weightCost": 0.3,
      "weightCapability": 0.4
    }
  }
}
```

### Classification Criteria

Models are categorized using multiple criteria:

#### Large Models (Complex Tasks)

- **Context Window**: 100k+ tokens preferred
- **Flagship Patterns**: GPT-4, Claude 3.5 Sonnet, Claude 3 Opus, Llama 3.1 405B, Gemini Pro
- **Cost Threshold**: $10+ per 1M input tokens (or cost-effective preference disabled)
- **Capabilities**: Vision, tool use, advanced reasoning

#### Small Models (Quick Tasks)

- **Context Window**: <100k tokens (optimal ~50k)
- **Fast Patterns**: GPT-3.5, Claude 3.5 Haiku, Claude 3 Haiku, Gemini Flash
- **Cost Threshold**: <$1 per 1M input tokens
- **Capabilities**: Text, code generation, basic tool use

## Provider Support

### Built-in Providers

- **Anthropic**: Claude models with API key authentication
- **OpenAI**: GPT models with API key authentication
- **Google**: Gemini models with API key authentication
- **Ollama**: Local models running on localhost:11434
- **Azure**: Azure OpenAI deployments
- **Custom**: Any OpenAI-compatible API endpoint

### Configuration Priority

1. `~/.local/share/opencode/auth.json` (highest priority)
2. `~/.config/opencode/opencode.json`
3. Project `opencode.json` (lowest priority)

### Example Provider Configuration

#### auth.json

```json
{
  "providers": {
    "anthropic": {
      "type": "anthropic",
      "apiKey": "{env:ANTHROPIC_API_KEY}"
    },
    "openai": {
      "type": "openai",
      "apiKey": "{env:OPENAI_API_KEY}",
      "baseURL": "https://api.openai.com/v1"
    }
  }
}
```

#### opencode.json

```json
{
  "provider": {
    "anthropic": {
      "options": {
        "baseURL": "https://api.anthropic.com/v1",
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      },
      "models": {
        "claude-3-5-sonnet-20241022": {
          "name": "Claude 3.5 Sonnet",
          "limit": {
            "context": 200000,
            "output": 8192
          }
        }
      }
    }
  }
}
```

## Caching

The plugin implements intelligent caching to improve performance:

- **Model Lists**: 1-hour TTL for API-discovered models
- **Models.dev Data**: 24-hour TTL for comprehensive model database
- **Provider Info**: Cached until configuration changes

Cache is stored in `.opencode/model-selector-cache.json` and automatically refreshed when expired or when `--forceApi`
is used.

## Development

```bash
# Install dependencies
bun install

# Build the plugin
bun run build

# Run in development mode
bun run dev

# Run tests
bun run test

# Lint code
bun run lint
```

## Architecture

```
src/
├── index.ts              # Plugin entry point
├── config/               # Configuration management
│   ├── types.ts          # TypeScript interfaces
│   └── loader.ts         # Config loading/saving
├── discovery/            # Model/provider discovery
│   ├── providers.ts      # Provider API integration
│   └── models-dev.ts     # Models.dev API client
├── classification/       # Model categorization
│   └── categorizer.ts    # Scoring algorithms
├── ui/                   # User interface
│   └── selector.ts       # TUI components
└── commands/             # Command handlers
    ├── select-model.ts
    ├── list-models.ts
    ├── set-models.ts
    └── discover-models.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Issues

Report issues and feature requests at:  
https://github.com/pantheon-org/opencode-model-selector-plugin/issues
