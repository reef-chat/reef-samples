# Reef plugin examples

Example plugins live in **[github.com/reef-chat/reef-samples/tree/master/plugins](https://github.com/reef-chat/reef-samples/tree/master/plugins)** (this directory is the same layout).

Each subdirectory is a **complete plugin** you can copy to its own git repository. The repo root must contain `reef.plugin.json` (and any files referenced by `entry` paths).

**Rule:** manifest section keys and lockfile `contributes[]` use the **same plural ids** (`skills`, `endpoint_tools`, `lens_tools`, …).

## Host on git (one plugin = one repo)

```bash
# 1. Copy a folder out of this monorepo (example: skill-only plugin)
cp -R example-skill-grocery ~/reef-plugin-skill-grocery
cd ~/reef-plugin-skill-grocery
git init && git add . && git commit -m "Initial plugin"

# 2. Create an empty GitHub repo, then:
git remote add origin https://github.com/reef-chat/reef-plugin-skill-grocery.git
git push -u origin main

# 3. In Reef: Settings → Plugins → Install from URL → paste that repo URL
```

Reef downloads the default-branch source archive and expects `reef.plugin.json` at the archive root — same layout as a single-plugin GitHub repo.

**Local install without git:** from inside the plugin folder, `tar -czf plugin.tar.gz -C . .` and use **Install → Local**.

**Fastest install (mobile):** open the plugin on [reefchat.io/plugins](https://reefchat.io/plugins), tap **Copy install link**, then paste in Reef under **Settings → Plugins → Install plugin** (Remote → Git URL).

## Publishing official repos

Each sample maps to `github.com/reef-chat/reef-plugin-*` (plugin folder = repo root). From the monorepo root:

```bash
node scripts/publish-plugin-repos.mjs              # dry run
node scripts/publish-plugin-repos.mjs --execute    # create/push via gh CLI
node scripts/publish-plugin-repos.mjs --slug example-prompt-concise --execute
```

Verify Remote install in Reef with the copied HTTPS URL before enabling the landing **Copy install link** for that plugin.

## Example plugins

| Folder                                                             | Install as                        | Sections                                     |
| ------------------------------------------------------------------ | --------------------------------- | -------------------------------------------- |
| [`starter-research/`](starter-research/)                           | Full demo                         | skills, endpoint_tools, lens_tools, profiles |
| [`example-skill-grocery/`](example-skill-grocery/)                 | `reef-plugin-skill-grocery`         | `skills`                                     |
| [`example-skill-coding/`](example-skill-coding/)                   | `reef-plugin-skill-coding`          | `skills` (+ `SKILL.md` entry)                |
| [`example-prompt-concise/`](example-prompt-concise/)               | `reef-plugin-prompt-concise`        | `prompt_templates`                           |
| [`example-prompt-personas/`](example-prompt-personas/)             | `reef-plugin-prompt-personas`       | `prompt_templates` (×2)                      |
| [`example-tool-weather/`](example-tool-weather/)                   | `reef-plugin-tool-weather`          | `endpoint_tools`                             |
| [`example-tool-fetch-page/`](example-tool-fetch-page/)             | `reef-plugin-tool-fetch-page`       | `dynamic_tools` (network)                    |
| [`example-dynamic-tools-inline/`](example-dynamic-tools-inline/)   | `reef-plugin-dynamic-inline`        | `dynamic_tools` (inline JS)                  |
| [`example-dynamic-tools-files/`](example-dynamic-tools-files/)     | `reef-plugin-dynamic-files`         | `dynamic_tools` (`.js` entry)                |
| [`example-lens-active-inference/`](example-lens-active-inference/) | `reef-plugin-lens-active-inference` | `lens_tools`                                 |
| [`example-voice-native/`](example-voice-native/)                   | `reef-plugin-voice-native`          | `voice_profiles`                             |
| [`example-profile-research/`](example-profile-research/)           | `reef-plugin-profile-research`      | `profiles`                                   |

Combine several installed plugins on a profile under **Plugins** (enable each plugin id).

## Manifest (`manifest_version: "2"`)

Optional arrays (at least one non-empty): `skills`, `endpoint_tools`, `dynamic_tools`, `prompt_templates`, `lens_tools`, `voice_profiles`, `profiles`. Plugin-level `declared_capabilities.network_domains` for tools that use the network.

### `profiles[]` presets

Each entry uses the **same nested shape** as a profile document (subset of `ProfileSchema`): `name`, `api_settings`, optional `model`, `memory`, `mcp`, `configuration`, `database_connections`.

Required: `name`, `api_settings.api_url`, `api_settings.api_key` (`""`). Example optional paths: `model.name`, `model.system_prompt`, `memory.embeddings`, `memory.knowledge_graph_indexing`, `configuration.plugins.enabled_plugin_ids`, `configuration.tools`, `configuration.skills`.

Schema: [`ProfilePluginPayloadSchema`](https://github.com/reef-chat/reef/blob/main/reef-app/lib/modules/profiles/credentials/profile-share-exportable.schema.ts) (`ProfileShareExportableSchema` + required `name` / `api_settings`, no secrets).
