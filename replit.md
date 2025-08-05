# Visual Understanding Chat Assistant

## Overview

This is a full-stack web application that provides video analysis and conversational AI assistance for visual understanding. The system allows users to upload videos (up to 2 minutes), processes them to detect events and compliance violations, and provides an interactive chat interface where users can ask questions about the analyzed content. The application is designed for safety and compliance monitoring, with particular focus on traffic and pedestrian violations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern functional components using hooks for state management
- **Vite**: Fast development build tool with hot module replacement
- **Tailwind CSS + shadcn/ui**: Responsive design system with pre-built components
- **TanStack Query**: Client-side data fetching and caching
- **Wouter**: Lightweight client-side routing

### Component Structure
- Modular component architecture with separation of concerns
- Custom UI components built on Radix UI primitives
- Responsive design supporting both desktop and mobile viewports
- Real-time video player with timeline integration
- Interactive chat interface with message bubbles and typing indicators

### Backend Architecture
- **Express.js**: RESTful API server with middleware support
- **TypeScript**: Type-safe server-side development
- **Memory Storage**: In-memory data persistence with interface for future database integration
- **File Upload Handling**: Video file processing with validation
- **Error Handling**: Centralized error management with proper HTTP status codes

### Data Layer
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Database Schema**: Structured tables for users, video analyses, and chat messages
- **Zod Validation**: Runtime type checking and schema validation
- **Shared Types**: Common TypeScript interfaces between client and server

### Video Processing Pipeline
- **File Validation**: Support for MP4 and WebM formats up to 100MB
- **Drag-and-Drop Upload**: Interactive file upload with progress tracking
- **Event Detection**: Analysis of traffic violations, pedestrian incidents, and compliance scoring
- **Timeline Generation**: Temporal mapping of detected events with severity classification

### Chat System
- **Multi-turn Conversations**: Persistent chat history with context awareness
- **Quick Actions**: Pre-defined queries for common analysis requests
- **Real-time Responses**: Simulated typing indicators and response streaming
- **Structured Messages**: Support for formatted content including violations and compliance scores

### State Management
- **React Hooks**: Local component state management
- **Context API**: Global state for video analysis and chat history
- **Query Client**: Cached server state management
- **Real-time Updates**: Immediate UI updates for user interactions

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with concurrent features
- **Express.js**: Node.js web application framework
- **TypeScript**: Static type checking and development tooling

### Database & ORM
- **Drizzle ORM**: Database toolkit with migrations support
- **Neon Database**: Serverless PostgreSQL database (via @neondatabase/serverless)
- **connect-pg-simple**: PostgreSQL session store for Express

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component library for accessibility
- **Lucide React**: Icon library with consistent styling
- **Class Variance Authority**: CSS-in-JS utility for component variants

### Development Tools
- **Vite**: Frontend build tool with plugins
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing with Autoprefixer

### Third-party Services
- **N8N Webhooks**: External workflow automation for video processing
- **Replit Integration**: Development environment with error overlay and cartographer plugins

### Validation & Utilities
- **Zod**: Schema validation library
- **React Hook Form**: Form state management with validation
- **Date-fns**: Date manipulation utilities
- **clsx & tailwind-merge**: CSS class manipulation utilities

### Development & Testing
- **TSX**: TypeScript execution for development
- **@types packages**: TypeScript definitions for JavaScript libraries
- **Replit plugins**: Development environment enhancements