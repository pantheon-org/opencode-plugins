import { convertTextToSVG } from './convertTextToSVG';

describe('convertTextToSVG', () => {
  test('renders basic ASCII text', () => {
    const svg = convertTextToSVG('OpenCode', { fontSize: 24, color: '#111' });
    expect(svg).toContain('OpenCode');
    expect(svg).toContain('font-size="24"');
    expect(svg.startsWith('<svg')).toBe(true);
  });

  test('escapes XML characters', () => {
    const svg = convertTextToSVG('<&>"\'', {});
    expect(svg).toContain('&lt;&amp;&gt;&quot;&apos;');
  });

  test('handles empty string', () => {
    const svg = convertTextToSVG('', {});
    expect(svg).toContain('<text');
  });

  test('handles non-ASCII', () => {
    const svg = convertTextToSVG('こんにちは', { fontSize: 30 });
    expect(svg).toContain('こんにちは');
  });

  test('includes role and aria-label when provided', () => {
    const svg = convertTextToSVG('Hi', { role: 'img', ariaLabel: 'greeting' });
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="greeting"');
  });
});

// lefthook test
