import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" className="min-h-screen bg-slate-50 p-6 text-slate-900">
          <h1 className="text-xl font-semibold">Aplikasi mengalami kendala</h1>
          <p className="mt-2 text-sm text-slate-600">Muat ulang halaman untuk mencoba lagi.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Muat ulang aplikasi
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
