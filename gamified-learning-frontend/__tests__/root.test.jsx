import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RootLayout from '../app/layout';


jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: 'mock-geist-sans',
    className: 'mock-geist-sans-class',
  }),
  Geist_Mono: () => ({
    variable: 'mock-geist-mono',
    className: 'mock-geist-mono-class',
  }),
}));

jest.mock('./globals.css', () => {});

describe('RootLayout', () => {
  it('renders the layout with the correct structure and children', () => {
    const testChildren = (
      <main data-testid="test-content">
        <h1>Hello World</h1>
      </main>
    );

    render(<RootLayout>{testChildren}</RootLayout>);

    const htmlElement = document.querySelector('html');
    expect(htmlElement).toBeInTheDocument();
    expect(htmlElement).toHaveAttribute('lang', 'en');

    const bodyElement = document.querySelector('body');
    expect(bodyElement).toBeInTheDocument();
    expect(bodyElement).toHaveClass('mock-geist-sans'); 
    expect(bodyElement).toHaveClass('mock-geist-mono'); 
    expect(bodyElement).toHaveClass('antialiased');

    const mainContent = screen.getByTestId('test-content');
    expect(mainContent).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hello World/i })).toBeInTheDocument();
  });
});