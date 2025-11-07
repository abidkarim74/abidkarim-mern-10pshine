import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainLoading from '../MainLoading';

describe('MainLoading', () => {
  it('renders without crashing', () => {
    const { container } = render(<MainLoading />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders the loading text', () => {
    const { getByText } = render(<MainLoading />);
    const loadingText = getByText('Loading EPIC Experience...');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveClass('text-blue-900');
  });

  it('renders the decorative text', () => {
    const { getByText } = render(<MainLoading />);
    const decorativeText = getByText('✨ Preparing something amazing...');
    expect(decorativeText).toBeInTheDocument();
    expect(decorativeText).toHaveClass('text-gray-600');
  });

  it('renders all three spinner circles', () => {
    const { container } = render(<MainLoading />);
    const spinners = container.querySelectorAll('.animate-spin');
    expect(spinners).toHaveLength(3);
  });

  it('renders three animated dots', () => {
    const { container } = render(<MainLoading />);
    const dots = container.querySelectorAll('.bg-gradient-to-r');
    expect(dots).toHaveLength(3);
  });

  it('applies correct animation styles to spinners', () => {
    const { container } = render(<MainLoading />);
    const spinners = container.querySelectorAll('.animate-spin');
    
    expect(spinners).toHaveLength(3);
  });

  it('has correct color classes for spinners', () => {
    const { container } = render(<MainLoading />);
    
    const blueSpinner = container.querySelector('[class*="border-blue-200"]');
    const crimsonSpinner = container.querySelector('[class*="DC143C"]');
    const graySpinner = container.querySelector('[class*="border-gray-300"]');
    
    expect(blueSpinner).toBeInTheDocument();
    expect(crimsonSpinner).toBeInTheDocument();
    expect(graySpinner).toBeInTheDocument();
  });

  it('renders background effects with blur', () => {
    const { container } = render(<MainLoading />);
    const backgroundEffects = container.querySelector('.fixed.inset-0');
    expect(backgroundEffects).toBeInTheDocument();
    
    const blurEffects = container.querySelectorAll('[class*="blur-3xl"]');
    expect(blurEffects.length).toBeGreaterThan(0);
  });
});