import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  dataKey: string;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

type State<T> =
  | { status: 'loading' }
  | { status: 'success'; items: T[] }
  | { status: 'error' };

export function CapabilityCard<T>({ title, description, path, dataKey, emptyText, renderItem }: Props<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<Record<string, T[]>>(path).then(
      (data) => {
        if (active) setState({ status: 'success', items: data[dataKey] });
      },
      () => {
        if (active) setState({ status: 'error' });
      },
    );
    return () => { active = false; };
  }, [path, dataKey]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2><p>{description}</p>
    {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
    {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}. Please try again later.</p>}
    {state.status === 'success' && (state.items.length === 0
      ? <p>{emptyText}</p>
      : <ul>{state.items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>)}
  </div></section>;
}
