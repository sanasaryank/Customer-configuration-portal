import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  isLeafDiffNode,
  isNestedDiffNode,
  renderDiffValue,
  DiffNodeRenderer,
  MISSING_SENTINEL,
} from '../historyDiff';

// Minimal i18n stub used in all DiffNodeRenderer tests
const t = (key: string): string => {
  const map: Record<string, string> = {
    'history.oldValue': 'Old',
    'history.newValue': 'New',
  };
  return map[key] ?? key;
};

// ─── isLeafDiffNode ───────────────────────────────────────────────────────────

describe('isLeafDiffNode', () => {
  it('returns true for a valid leaf node', () => {
    expect(isLeafDiffNode({ old: 'A', new: 'B' })).toBe(true);
  });

  it('returns true when old/new values are arrays', () => {
    expect(isLeafDiffNode({ old: ['a', 'b'], new: ['a', 'c'] })).toBe(true);
  });

  it('returns true when old/new values are null', () => {
    expect(isLeafDiffNode({ old: null, new: null })).toBe(true);
  });

  it('returns false for a nested diff object (no old/new)', () => {
    expect(isLeafDiffNode({ name: { old: 'A', new: 'B' } })).toBe(false);
  });

  it('returns false for an array', () => {
    expect(isLeafDiffNode([{ old: 'A', new: 'B' }])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isLeafDiffNode(null)).toBe(false);
  });

  it('returns false for a primitive', () => {
    expect(isLeafDiffNode('leaf')).toBe(false);
  });

  it('returns false for an object missing "new"', () => {
    expect(isLeafDiffNode({ old: 'A' })).toBe(false);
  });

  it('returns false for an object missing "old"', () => {
    expect(isLeafDiffNode({ new: 'B' })).toBe(false);
  });
});

// ─── isNestedDiffNode ─────────────────────────────────────────────────────────

describe('isNestedDiffNode', () => {
  it('returns true for a non-empty nested object', () => {
    expect(isNestedDiffNode({ name: { old: 'A', new: 'B' } })).toBe(true);
  });

  it('returns false for a leaf diff node', () => {
    expect(isNestedDiffNode({ old: 'A', new: 'B' })).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isNestedDiffNode({})).toBe(false);
  });

  it('returns false for an array', () => {
    expect(isNestedDiffNode([])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isNestedDiffNode(null)).toBe(false);
  });
});

// ─── renderDiffValue ──────────────────────────────────────────────────────────

describe('renderDiffValue', () => {
  it('renders a plain string', () => {
    const { container } = render(<>{renderDiffValue('hello')}</>);
    expect(container).toHaveTextContent('hello');
  });

  it('renders the missing sentinel with italic styling', () => {
    const { container } = render(<>{renderDiffValue(MISSING_SENTINEL)}</>);
    expect(container.querySelector('span.italic')).toBeInTheDocument();
    expect(container).toHaveTextContent('<missing>');
  });

  it('renders null as "null"', () => {
    const { container } = render(<>{renderDiffValue(null)}</>);
    expect(container).toHaveTextContent('null');
  });

  it('renders a boolean true as "true"', () => {
    const { container } = render(<>{renderDiffValue(true)}</>);
    expect(container).toHaveTextContent('true');
  });

  it('renders an empty array as "[]"', () => {
    const { container } = render(<>{renderDiffValue([])}</>);
    expect(container).toHaveTextContent('[]');
  });

  it('renders a non-empty array as a pre/JSON block', () => {
    const { container } = render(<>{renderDiffValue(['a', 'b'])}</>);
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre!.textContent).toContain('"a"');
    expect(pre!.textContent).toContain('"b"');
  });

  it('renders an empty string as —', () => {
    const { container } = render(<>{renderDiffValue('')}</>);
    expect(container).toHaveTextContent('—');
  });
});

// ─── DiffNodeRenderer ─────────────────────────────────────────────────────────

describe('DiffNodeRenderer', () => {
  // 1. Simple scalar diff
  it('renders a simple scalar diff', () => {
    const node = { name: { old: 'A', new: 'B' } };
    render(<DiffNodeRenderer node={node} t={t} />);
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('Old')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  // 2. Nested object diff
  it('renders a nested object diff', () => {
    const node = {
      user: {
        profile: {
          firstName: { old: 'John', new: 'Jon' },
        },
      },
    };
    render(<DiffNodeRenderer node={node} t={t} />);
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('profile')).toBeInTheDocument();
    expect(screen.getByText('firstName')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jon')).toBeInTheDocument();
  });

  // 3. Missing value sentinel
  it('renders missing value with styled marker', () => {
    const node = { isBlocked: { old: MISSING_SENTINEL, new: 'true' } };
    const { container } = render(<DiffNodeRenderer node={node} t={t} />);
    expect(screen.getByText('isBlocked')).toBeInTheDocument();
    expect(container.querySelector('span.italic')).toBeInTheDocument();
    expect(container).toHaveTextContent('<missing>');
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  // 4. Password diff — shows Old/New labels; values are plain strings from backend
  it('renders a password diff without revealing special behaviour', () => {
    const node = { password: { old: 'Old', new: 'New' } };
    render(<DiffNodeRenderer node={node} t={t} />);
    expect(screen.getByText('password')).toBeInTheDocument();
    // 'Old' and 'New' appear as both i18n labels and as values
    const olds = screen.getAllByText('Old');
    const news = screen.getAllByText('New');
    expect(olds.length).toBeGreaterThanOrEqual(1);
    expect(news.length).toBeGreaterThanOrEqual(1);
  });

  // 5. Atomic array diff
  it('renders an atomic array diff as a JSON block', () => {
    const node = { tags: { old: ['a', 'b'], new: ['a', 'c'] } };
    const { container } = render(<DiffNodeRenderer node={node} t={t} />);
    expect(screen.getByText('tags')).toBeInTheDocument();
    const pres = container.querySelectorAll('pre');
    expect(pres.length).toBe(2);
    expect(pres[0].textContent).toContain('"a"');
    expect(pres[0].textContent).toContain('"b"');
    expect(pres[1].textContent).toContain('"a"');
    expect(pres[1].textContent).toContain('"c"');
  });

  // 6. Array of objects diff — backend match labels appear as group headers
  it('renders array-of-objects diff with match labels', () => {
    const node = {
      items: {
        'id=10': {
          price: { old: '500', new: '550' },
        },
        'new:id=15': {
          name: { old: MISSING_SENTINEL, new: 'Cola' },
        },
      },
    };
    render(<DiffNodeRenderer node={node} t={t} />);
    expect(screen.getByText('items')).toBeInTheDocument();
    expect(screen.getByText('id=10')).toBeInTheDocument();
    expect(screen.getByText('price')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('550')).toBeInTheDocument();
    expect(screen.getByText('new:id=15')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Cola')).toBeInTheDocument();
  });

  // 7. Array-item labels use the indigo styling, not the default grey
  it('applies array-item label styling for match labels', () => {
    const node = {
      items: {
        'id=10': { price: { old: '500', new: '550' } },
      },
    };
    const { container } = render(<DiffNodeRenderer node={node} t={t} />);
    // "id=10" header should have the indigo class, not the gray class
    const allHeaders = container.querySelectorAll('div.text-indigo-700');
    expect(allHeaders.length).toBeGreaterThan(0);
  });

  // 8. Empty diff renders nothing
  it('renders nothing for an empty diff object', () => {
    const { container } = render(<DiffNodeRenderer node={{}} t={t} />);
    expect(container.firstChild).toBeNull();
  });

  // 9. Node with only empty nested children renders nothing
  it('renders nothing when all nested children are empty', () => {
    const { container } = render(<DiffNodeRenderer node={{ a: {} }} t={t} />);
    expect(container.firstChild).toBeNull();
  });
});
