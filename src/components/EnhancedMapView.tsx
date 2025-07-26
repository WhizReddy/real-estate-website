'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { 
  MapPin, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Filter,
  Navigation,
  Home,
  ExternalLink,
  Maximize2,
  Minimize2,
  Layers,
  Target,
  Phone,
  Mail,
  Share2
} from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';

interface EnhancedMapViewProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (proper