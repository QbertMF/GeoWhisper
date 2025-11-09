import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { AppIconName, AppIcons } from '../constants/AppIcons';

interface IconProps {
  name: AppIconName | string; // Allow both our constants and raw icon names
  size?: number;
  color?: string;
  style?: any;
}

export default function Icon({ 
  name, 
  size = 24, 
  color = '#000', 
  style 
}: IconProps) {
  // Get the actual Ionicon name from our constants or use the string directly
  const iconName = (AppIcons[name as AppIconName] || name) as any;
  
  return (
    <Ionicons 
      name={iconName} 
      size={size} 
      color={color} 
      style={style} 
    />
  );
}

// Specialized components for common use cases
export function TabIcon({ name, color, size = 28 }: { name: AppIconName; color: string; size?: number }) {
  return <Icon name={name} size={size} color={color} style={{ marginBottom: -3 }} />;
}

export function HeaderIcon({ name, color, size = 25, style }: { name: AppIconName; color: string; size?: number; style?: any }) {
  return <Icon name={name} size={size} color={color} style={style} />;
}

export function ButtonIcon({ name, color = '#007AFF', size = 20 }: { name: AppIconName; color?: string; size?: number }) {
  return <Icon name={name} size={size} color={color} />;
}