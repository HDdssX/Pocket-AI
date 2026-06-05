# Pocket AI

Pocket AI is a personal, local-first mobile chat app built with Expo and React Native.

It talks directly to an OpenAI-compatible Responses API endpoint from the device, supports text/images/files, and keeps chat state on the phone.

## Current Features

- White mobile chat UI inspired by modern AI chat apps.
- Multiple local API profiles.
- API profile "Done" saves and automatically applies the edited profile as the active backend.
- Per-profile API key storage with `expo-secure-store`.
- OpenAI Responses API request flow.
- DeepSeek / Chat Completions compatible request flow.
- Streaming assistant output with stop support.
- Text, image, and file attachment input.
- Android image share / split-screen drag-in support; received images enter the pending attachment queue.
- Compact copy-only message action; copied state changes to a check mark.
- Credential-like text such as passwords, API keys, tokens, commands, paths, and URLs uses a monospace horizontal block for safer reading and copying.
- In-flight generation can be stopped from the composer.
- Assistant replies can attach downloaded image/document URLs when the provider returns links.
- Local encrypted chat/session storage.
- Local session manager.
- Model-name based `Codex` / `CLI` display label.
- Chinese and English UI strings.

## Local Storage

The app stores:

- API keys: system SecureStore / Android Keystore.
- Chat sessions, API profile metadata, and UI state: encrypted `AsyncStorage` key `ai-chat-pocket.state.v1`.
- State encryption key: system SecureStore / Android Keystore key `ai-chat-pocket.state-encryption-key.v1`.
- Imported attachments: app-private file storage copied through Expo FileSystem.

Uninstalling the app or using "Clear local data" removes local app state.

## Important Security Note

This app is intended for personal use. API keys live on the client device. Do not distribute this as a public untrusted client unless you add a backend proxy or another key-protection strategy.

## Project Structure

```text
App.tsx                            Main app UI and state wiring
index.ts                           Expo entry
app.json                           Expo app config
assets/                            App icons and splash assets
src/components/MessageBubble.tsx   Chat message rendering and Markdown styles
src/lib/files.ts                   Image/file picking and attachment persistence
src/lib/ids.ts                     ID helper
src/lib/models.ts                  Default API profile and model helpers
src/lib/openai.ts                  Responses and Chat Completions request construction
src/lib/storage.ts                 Encrypted local state and API key storage
src/types.ts                       Shared TypeScript types
android/                           Generated native Android project used for APK builds
android/app/src/main/java/.../SharedImageModule.kt
                                   Android bridge for shared/dragged image URIs
```

## API Profiles

The settings screen supports multiple API profiles. Each profile stores:

- Endpoint mode: `OpenAI Responses` or `Chat Completions compatible`.
- Base URL: only the API root, not the final path.
- Model name.
- API key, stored separately in SecureStore.
- Optional system prompt.

DeepSeek example:

```text
Endpoint mode: Chat Completions compatible
Base URL: https://api.deepseek.com
Model: deepseek-v4-flash
Project ID: empty
Organization: empty
System prompt: You are a concise Chinese assistant. Answer with a short conclusion first, then examples.
```

OpenAI Responses example:

```text
Endpoint mode: OpenAI Responses
Base URL: https://api.openai.com/v1
Model: gpt-5.4
Project ID: optional OpenAI project id, such as proj_xxx
Organization: optional OpenAI organization id, such as org_xxx
System prompt: You are a careful coding assistant. Prefer practical, tested answers.
```

`Project ID` and `Organization` are OpenAI routing/account fields. DeepSeek does not need them. The system prompt is a long-lived instruction sent with conversation context.

## Next Optimizations

Recommended order:

1. API profile test button.
   Add a lightweight "Test connection" action that checks API key validity, Base URL, endpoint mode, and model availability.
2. Split `App.tsx`.
   Move large UI and state areas into focused modules such as `ChatScreen`, `Composer`, `SettingsModal`, `ApiProfilesModal`, `SessionsModal`, `useChatState`, and `useApiProfiles`.
3. Rich generated files.
   Add provider-specific image generation and PDF/DOCX export. Current support covers downloaded image/document URLs only.
4. Better conversation management.
   Add rename, search, pin, batch delete, and full conversation export.
5. Context window control.
   Avoid resending unbounded local history by supporting recent-message windows, older-message summaries, and provider-specific token limits.
6. Provider capability flags.
   Track which profiles support Responses chaining, images, files, system messages, and thinking/reasoning parameters.
7. Human-friendly API errors.
   Map common failures like 401, 404, 429, timeout, and incompatible response format into actionable messages.
8. Security hardening.
   Consider app lock / biometric unlock, encrypted backup/restore, and a real release signing keystore before final distribution.

## Development

Install dependencies:

```powershell
cd E:\android\projects\ai-chat-pocket
npm install
```

Type-check:

```powershell
cmd /c node_modules\.bin\tsc.cmd --noEmit
```

Build standalone Android release APK:

```powershell
cd E:\android\projects\ai-chat-pocket\android
$env:JAVA_HOME='D:\JAVA\jdk-21.0.2.13-hotspot'
cmd /c gradlew.bat assembleRelease
```

The APK is generated at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Install to connected Android device:

```powershell
adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

This project can be tested as a standalone APK. A Metro server is not required for normal installed-app testing.

## GitHub Upload

The project is intended to stay private/closed-source.

Keep daily development in:

```text
E:\android\projects\ai-chat-pocket
```

Use the sibling folder below as the selective Git/GitHub version:

```text
E:\android\projects\ai-chat-pocket-git
```

That folder should contain only the source/config/docs/assets needed for the private repository. It should exclude generated caches, build outputs, `node_modules`, local SDK paths, debug keystores, local device logs, and private local state.
