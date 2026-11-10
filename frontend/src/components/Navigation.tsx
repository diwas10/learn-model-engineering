'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Search,
  BookOpen,
  Award,
  Terminal,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useMastery } from '@/lib/masteryStore';
import { searchCurriculum } from '@/lib/curriculum';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { masteredCount, totalLessons, completionPercentage } = useMastery();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [labsDropdownOpen, setLabsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length >= 2) {
      return searchCurriculum(searchQuery).slice(0, 8);
    }
    return [];
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLabsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Curriculum & Labs', icon: Compass },
    { href: '/playground', label: 'Code Lab', icon: Terminal },
    { href: '/capstones', label: 'Capstones', icon: Award }
  ];

  const labsList = [
    { href: '/labs/transformer', label: 'Transformer Architecture Lab', desc: 'Attention, RoPE, SwiGLU, KV Cache, MoE' },
    { href: '/labs/model-surgery', label: 'Model Surgery & PEFT Lab', desc: 'LoRA, QLoRA, Layer Expansion, Merging' },
    { href: '/labs/inference', label: 'AI Inference Profiler Lab', desc: 'Prefill/Decode, PagedAttention, Speculative Decoding' },
    { href: '/labs/mathematics', label: 'Mathematical Visualization Lab', desc: 'Eigenvectors, SVD, Jacobians, Landscapes' },
    { href: '/labs/neural-networks', label: 'Neural Network Dynamics Lab', desc: 'Activations, Initialization, Gradient Highways' },
    { href: '/labs/multimodal', label: 'Multimodal Engineering Lab', desc: 'ViT Patches, Audio Spectrograms, Cross-Attention' },
    { href: '/labs/agents', label: 'Agentic AI & Systems Lab', desc: 'Tool calling, ReAct loops, MCP architecture' },
    { href: '/labs/shapes', label: 'Tensor Shape Debugger', desc: 'Tensor dimensions & einsum inspector' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="truncate">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Model Engineering
                <span className="hidden xs:inline-flex items-center rounded-md bg-cyan-950 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 ring-1 ring-inset ring-cyan-800/60">
                  Mastery
                </span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-slate-400 truncate">
                Foundations to Multimodal Systems
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/80 text-cyan-400 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Labs Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLabsDropdownOpen(!labsDropdownOpen)}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  pathname.startsWith('/labs')
                    ? 'bg-slate-800/80 text-cyan-400 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Laboratories</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {labsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Interactive Laboratories
                  </div>
                  <div className="space-y-1">
                    {labsList.map((lab) => (
                      <Link
                        key={lab.href}
                        href={lab.href}
                        onClick={() => setLabsDropdownOpen(false)}
                        className="block rounded-xl p-2.5 hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="text-xs font-semibold text-slate-200 hover:text-cyan-400">
                          {lab.label}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {lab.desc}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right actions: Search + Mastery Pill + Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-1.5 sm:space-x-2 rounded-xl border border-slate-800 bg-slate-900/60 px-2.5 sm:px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Mastery Pill */}
            <Link
              href="/"
              className="flex items-center space-x-1.5 sm:space-x-2 rounded-xl border border-indigo-800/40 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 px-2.5 sm:px-3 py-1.5 text-xs text-indigo-300 hover:border-indigo-700/60 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold">{masteredCount}</span>
              <span className="hidden xs:inline text-indigo-400/80">/ {totalLessons}</span>
              <div className="hidden lg:block h-2 w-12 rounded-full bg-slate-800 overflow-hidden ml-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(completionPercentage, 2)}%` }}
                />
              </div>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-4 backdrop-blur-xl animate-in slide-in-from-top-2">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-cyan-400'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-800/80 pt-3">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Flagship Interactive Laboratories
              </span>
              <div className="grid grid-cols-1 gap-1">
                {labsList.map((lab) => (
                  <Link
                    key={lab.href}
                    href={lab.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300 transition-colors"
                  >
                    <span>{lab.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-slate-300 w-full">
                <Search className="h-5 w-5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search across all 253 lessons, math derivations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 max-h-80 sm:max-h-96 overflow-y-auto space-y-2">
              {searchQuery.trim().length < 2 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Type at least 2 characters to search across 28 modules and 253 lessons...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No matching lessons found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map(({ lesson, module }) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSearchOpen(false);
                      // Dispatch hash event or navigate smoothly
                      window.location.hash = lesson.id;
                    }}
                    className="w-full text-left block rounded-xl border border-slate-800/80 bg-slate-800/30 p-3 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-cyan-400">
                        {lesson.id}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {module.title}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {lesson.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 line-clamp-1">
                      {lesson.learning_objectives[0]}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
