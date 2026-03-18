// Extend for div too
import 'react';

declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
  interface CSSProperties extends React.CSSProperties {
    [key: `--${string}`]: string | number;
  }
}