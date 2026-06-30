import React from 'react';
import { cn, statusColor } from '../../utils';
import { Loader2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
