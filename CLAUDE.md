# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript + Vite project that integrates with Unreal Engine pixel streaming infrastructure. The application provides a web interface for interacting with UE applications through pixel streaming, featuring various demo components, camera controls, and interactive 3D scene manipulation.

## Development Commands

- `npm run dev` - Start the development server
- `npm run build` - Build for production (includes TypeScript checking)
- `npm run preview` - Preview production build locally
- `npm run buildDep` - Build dependencies (Pixel Streaming libraries)

## Architecture Overview

### Core Components

1. **Pixel Streaming Integration**
   - Uses `@epicgames-ps/lib-pixelstreamingfrontend-ue5.3` and UI library
   - Custom `Viewer` class in `components/lib/Viewer.js` wraps Epic's streaming functionality
   - Handles WebRTC communication with UE applications

2. **Application Structure**
   - `App.vue` - Root component with shared state management via provide/inject
   - `components/sence.vue` - Main scene container
   - `components/TabDemo.vue` - Tab interface for various demos
   - Extensive component library under `components/lib/`

3. **Component Architecture**
   - **Scene Management**: `lib/Scene/` contains scene controls, cameras, weather systems
   - **Layer System**: `lib/Layer/` contains various visualization layers (polylines, points, billboards)
   - **Tools**: `lib/Tool/` contains interactive editing and selection tools
   - **Demo Components**: Various `Demo*.vue` files showcase different features

### Key Systems

1. **Communication with UE**
   - Bidirectional messaging through pixel streaming
   - Event-driven architecture using EventEmitter
   - Message/response callback system in Viewer class

2. **State Management**
   - Uses Vue's provide/inject for global state sharing
   - Reactive shared data object accessible across components
   - Event handler registration system for UE messages

3. **Component Categories**
   - **Camera Controls**: Multiple camera modes (free flight, tourist, map view)
   - **Scene Tools**: Point editing, polyline drawing, selection tools
   - **UI Layers**: Billboard overlays, widget positioning
   - **Environmental**: Weather, sky, seasonal settings

## Working with this Codebase

### Adding New Demo Components
- Follow the naming convention `Demo*.vue` for demo components
- Use the shared state system via inject for accessing `viewerReady` and other global state
- Register message handlers using the provided `addHandler` function

### Pixel Streaming Integration
- The `Viewer` class handles all UE communication
- Use `sendMessage()` for UI interactions and `sendCommand()` for direct commands
- Response handling is done through event listeners with callback registration

### Layer Development
- Extend `DasLayerBase.js` for new layer types
- Follow the established pattern of TypeScript definitions (.d.ts files) alongside JavaScript implementations
- Layer management is centralized through the layer control system

### Scene Interaction
- Scene operations are centralized in `lib/Scene/Scene.js`
- Coordinate system conversion utilities available
- Level loading/unloading and pawn switching capabilities

## Important Notes

- This project uses a hybrid approach with both TypeScript (.ts, .vue) and JavaScript (.js) files
- Type definitions are provided separately (.d.ts files) for JavaScript modules
- The pixel streaming infrastructure is located in the parent `PixelStreamingInfrastructure/` directory
- Chinese comments are prevalent throughout the codebase - maintain this convention when adding new features
- 代码简洁，没提到的不要写

## 输出规范
Plan模式只显示变更的内容。Plan模式每次都要.md文件来说明Plan。而不是直接显示文本
.md在工程目录生成