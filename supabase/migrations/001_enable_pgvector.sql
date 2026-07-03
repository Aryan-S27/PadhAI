-- ═══════════════════════════════════════════════════════
-- Migration 001: Enable pgvector extension
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════
create extension if not exists vector;
