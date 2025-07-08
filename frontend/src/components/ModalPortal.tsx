// src/components/ModalPortal.tsx
import { useEffect, useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
  wrapperId?: string; // Optional ID for a specific wrapper element
}

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement('div');
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

export default function ModalPortal({ children, wrapperId = "modal-root" }: ModalPortalProps) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(wrapperId);
    let systemCreated = false;

    // if element does not exist with wrapperId, create and append it to body
    if (!element) {
      systemCreated = true;
      element = createWrapperAndAppendToBody(wrapperId);
    }
    setWrapperElement(element);

    return () => {
      // delete the programatically created element
      if (systemCreated && element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  }, [wrapperId]);

  // wrapperElement will be null on first render.
  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
}