import { useEffect } from 'react';

// Browsers use the document title as the suggested PDF filename. Handle native
// Ctrl/Cmd+P as well as our button, and restore the app title after save or cancel.
export default function useResumePrint(name: string) {
  useEffect(() => {
    let originalTitle: string | undefined;

    function beforePrint() {
      originalTitle ??= document.title;
      const filename = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
        .replace(/\s+/g, ' ').trim().replace(/[. ]+$/, '');
      document.title = filename ? `${filename} - Resume` : 'Resume';
    }

    function afterPrint() {
      if (originalTitle === undefined) return;
      document.title = originalTitle;
      originalTitle = undefined;
    }

    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
      afterPrint();
    };
  }, [name]);

  return () => window.print();
}
