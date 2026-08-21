#!/usr/bin/env bash
# HealthPulse - stop backend + ML service (leaves MongoDB running)
pkill -f "node server.js" 2>/dev/null && echo "backend stopped"    || echo "backend not running"
pkill -f "src/api.py"     2>/dev/null && echo "ML service stopped" || echo "ML service not running"
pkill -f "vite"           2>/dev/null && echo "frontend stopped"   || echo "frontend not running"
echo "MongoDB left running (stop with: brew services stop mongodb/brew/mongodb-community)"
